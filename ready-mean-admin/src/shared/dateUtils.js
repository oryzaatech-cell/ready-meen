export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatShortDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
  });
}

export function getDateRange(preset) {
  const now = new Date();
  const to = now.toISOString().split('T')[0];
  let from;

  switch (preset) {
    case 'today': {
      from = to;
      break;
    }
    case '7d': {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      from = d.toISOString().split('T')[0];
      break;
    }
    case '30d': {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      from = d.toISOString().split('T')[0];
      break;
    }
    case 'month': {
      from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      break;
    }
    default:
      return null;
  }

  return { from, to };
}
