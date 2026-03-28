import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import supabase from '../config/supabase.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { sendNotification } from '../services/notificationService.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Optional auth — attaches req.user if token present, continues otherwise
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }
  // Reuse the real authenticateUser but swallow errors so public access still works
  authenticateUser(req, res, (err) => {
    // If auth fails, just continue without req.user
    next();
  });
}

// GET /api/products — Browse available products (public, auto-filtered for linked customers)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, vendor_id } = req.query;

    let query = supabase
      .from('product_info')
      .select('id, name, price, stock_qty, image_url, vendor_id, category, cutting_options, cleaning_charge, created_at')
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('name', `%${search}%`);

    // If authenticated customer has a linked vendor, auto-filter to that vendor's products
    if (req.user?.role === 'customer' && req.user?.vendor_id) {
      query = query.eq('vendor_id', req.user.vendor_id);
    } else if (vendor_id) {
      query = query.eq('vendor_id', vendor_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Products fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }

    res.json({ products: data });
  } catch (err) {
    console.error('Products route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/products/mine — Vendor's own products (MUST be before /:id)
router.get('/mine', authenticateUser, requireRole('vendor'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('product_info')
      .select('id, name, price, stock_qty, image_url, category, cutting_options, cleaning_charge, description, created_at')
      .eq('vendor_id', req.user.db_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Vendor products fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }

    res.json({ products: data });
  } catch (err) {
    console.error('Vendor products route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/products/:id — Get single product
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('product_info')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product: data });
  } catch (err) {
    console.error('Product detail error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/products/upload-image — Upload product image to Supabase Storage
router.post('/upload-image', authenticateUser, requireRole('vendor', 'admin'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Auto-rotate based on EXIF orientation, then resize and compress
    const compressed = await sharp(req.file.buffer)
      .rotate()
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const fileName = `${req.user.db_id}/${Date.now()}.webp`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, compressed, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (uploadError) {
      console.error('Image upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload image' });
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    res.json({ image_url: urlData.publicUrl });
  } catch (err) {
    console.error('Image upload route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/products — Add product (vendor or admin)
router.post('/', authenticateUser, requireRole('vendor', 'admin'), async (req, res) => {
  try {
    const { name, category, description, image_url, price, stock_qty, cleaning_charge, cutting_options } = req.body;

    if (!name || price === undefined || price === null) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }
    if (stock_qty !== undefined && (typeof stock_qty !== 'number' || stock_qty < 0)) {
      return res.status(400).json({ error: 'Stock quantity must be a positive number' });
    }

    const { data, error } = await supabase
      .from('product_info')
      .insert({
        vendor_id: req.user.db_id,
        name,
        category: category || null,
        description: description || null,
        image_url: image_url || null,
        price,
        stock_qty: stock_qty || 0,
        cleaning_charge: cleaning_charge ?? null,
        cutting_options: cutting_options ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Product create error:', error);
      return res.status(500).json({ error: 'Failed to create product' });
    }

    // Notify all customers linked to this vendor (non-blocking)
    const vendorId = req.user.db_id;
    supabase
      .from('user_info')
      .select('id')
      .eq('vendor_id', vendorId)
      .then(({ data: customers }) => {
        for (const customer of (customers || [])) {
          sendNotification(customer.id, {
            title: 'New Fish Added!',
            body: `${data.name} is now available — check it out!`,
            data: { type: 'new_product', product_id: String(data.id) },
          }).catch(() => {});
        }
      })
      .catch(() => {});

    res.status(201).json({ product: data });
  } catch (err) {
    console.error('Product create route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/products/:id — Update product (owner vendor or admin)
router.put('/:id', authenticateUser, requireRole('vendor', 'admin'), async (req, res) => {
  try {
    // Verify ownership (vendors can only edit their own)
    if (req.user.role === 'vendor') {
      const { data: existing } = await supabase
        .from('product_info')
        .select('vendor_id')
        .eq('id', req.params.id)
        .single();

      if (!existing || existing.vendor_id !== req.user.db_id) {
        return res.status(403).json({ error: 'Not authorized to update this product' });
      }
    }

    const { name, category, description, image_url, price, stock_qty, cleaning_charge, cutting_options } = req.body;

    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }
    if (stock_qty !== undefined && (typeof stock_qty !== 'number' || stock_qty < 0)) {
      return res.status(400).json({ error: 'Stock quantity must be a positive number' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (image_url !== undefined) updates.image_url = image_url;
    if (price !== undefined) updates.price = price;
    if (stock_qty !== undefined) updates.stock_qty = stock_qty;
    if (cleaning_charge !== undefined) updates.cleaning_charge = cleaning_charge;
    if (cutting_options !== undefined) updates.cutting_options = cutting_options;

    const { data, error } = await supabase
      .from('product_info')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      console.error('Product update error:', error);
      return res.status(500).json({ error: 'Failed to update product' });
    }

    res.json({ product: data });
  } catch (err) {
    console.error('Product update route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/products/:id — Delete product (owner vendor or admin)
router.delete('/:id', authenticateUser, requireRole('vendor', 'admin'), async (req, res) => {
  try {
    if (req.user.role === 'vendor') {
      const { data: existing } = await supabase
        .from('product_info')
        .select('vendor_id')
        .eq('id', req.params.id)
        .single();

      if (!existing || existing.vendor_id !== req.user.db_id) {
        return res.status(403).json({ error: 'Not authorized to delete this product' });
      }
    }

    const { error } = await supabase
      .from('product_info')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Product delete error:', error);
      return res.status(500).json({ error: 'Failed to delete product' });
    }

    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Product delete route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
