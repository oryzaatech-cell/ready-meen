import { useState } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';

export default function AddressForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    label: initial?.label || '',
    flat_name: initial?.flat_name || '',
    flat_number: initial?.flat_number || '',
    floor: initial?.floor || '',
    area: initial?.area || '',
    name: initial?.name || '',
    phone: initial?.phone || '',
  });
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.flat_name.trim()) errs.flat_name = 'Building name is required';
    if (!form.area.trim()) errs.area = 'Area is required';
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) {
      errs.phone = 'Phone is required';
    } else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      errs.phone = 'Enter a valid 10-digit mobile number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      label: form.label.trim() || null,
      flat_name: form.flat_name.trim(),
      flat_number: form.flat_number.trim() || null,
      floor: form.floor.trim() || null,
      area: form.area.trim(),
      name: form.name.trim(),
      phone: form.phone.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        label="Label (e.g. Home, Office)"
        placeholder="Optional"
        value={form.label}
        onChange={set('label')}
      />
      <Input
        label="Building / Villa Name *"
        value={form.flat_name}
        onChange={set('flat_name')}
        error={errors.flat_name}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Flat / Villa No."
          value={form.flat_number}
          onChange={set('flat_number')}
        />
        <Input
          label="Floor"
          value={form.floor}
          onChange={set('floor')}
        />
      </div>
      <Input
        label="Area / Locality *"
        value={form.area}
        onChange={set('area')}
        error={errors.area}
      />
      <Input
        label="Recipient Name *"
        value={form.name}
        onChange={set('name')}
        error={errors.name}
      />
      <Input
        label="Phone *"
        type="tel"
        value={form.phone}
        onChange={set('phone')}
        error={errors.phone}
      />
      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading} className="flex-1">
          {initial ? 'Update Address' : 'Save Address'}
        </Button>
      </div>
    </form>
  );
}
