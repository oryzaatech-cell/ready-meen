import Badge from './ui/Badge';
import { STATUS_LABELS, STATUS_COLORS } from '../shared/constants';

export default function OrderStatusBadge({ status }) {
  return (
    <Badge color={STATUS_COLORS[status] || 'gray'}>
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}
