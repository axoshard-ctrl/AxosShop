# 🛠️ How to Use the New Features - Developer Guide

## Components Overview & Usage

### 1. **ProductComparison**
```tsx
import { ProductComparison } from '@/components/ProductComparison';

const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

<ProductComparison 
  products={selectedProducts}
  onRemove={(productId) => setSelectedProducts(prev => 
    prev.filter(p => p.id !== productId)
  )}
  onAddToCart={(product) => handleAddToCart(product)}
/>
```

### 2. **ProductGallery**
```tsx
import { ProductGallery } from '@/components/ProductGallery';

<ProductGallery 
  images={[
    "/image1.jpg",
    "/image2.jpg",
    "/image3.jpg"
  ]}
  productName="Purple Axolotl T-Shirt"
/>
```

### 3. **AdminAuditLogs**
```tsx
import { AdminAuditLogs } from '@/components/AdminAuditLogs';

const auditLogs = [
  {
    id: "1",
    action: "update",
    entityType: "Product",
    entityId: "prod-123",
    entityName: "Purple Axolotl T-Shirt",
    adminId: "admin-1",
    adminName: "John Doe",
    changes: {
      price: { old: 29.99, new: 24.99 }
    },
    timestamp: new Date(),
    ipAddress: "192.168.1.1"
  }
];

<AdminAuditLogs logs={auditLogs} />
```

### 4. **LoyaltyProgram**
```tsx
import { LoyaltyProgram } from '@/components/LoyaltyProgram';

const loyaltyStats = {
  userId: "user-123",
  totalPoints: 2500,
  pointsThisMonth: 350,
  totalSpent: 1250.00,
  totalOrders: 12,
  tier: "gold",
  nextTierPoints: 5000,
  availableRewards: 5
};

<LoyaltyProgram stats={loyaltyStats} />
```

### 5. **BulkProductImport**
```tsx
import { BulkProductImport } from '@/components/BulkProductImport';

<BulkProductImport />
```

**CSV Format Expected:**
```
name,description,price,stock,category,imageUrl,isActive,discountType,discountValue
Purple Axolotl T-Shirt,Soft cotton tee,29.99,50,tshirt,/img.jpg,true,percentage,10
```

### 6. **EmailServiceConfig**
```tsx
import { EmailServiceConfig } from '@/components/EmailServiceConfig';

<EmailServiceConfig />
```

**Supported Providers:**
- SendGrid
- Mailgun
- AWS SES
- Custom SMTP

### 7. **ThemeCustomizer**
```tsx
import { ThemeCustomizer } from '@/components/ThemeCustomizer';

<ThemeCustomizer />
```

### 8. **NotificationCenter**
```tsx
import { NotificationCenter } from '@/components/NotificationCenter';

const notifications = [
  {
    id: "1",
    type: "success",
    title: "Order Confirmed",
    message: "Your order #12345 has been confirmed",
    timestamp: new Date(),
    read: false,
    action: { label: "View Order", href: "/orders/12345" }
  },
  {
    id: "2",
    type: "warning",
    title: "Low Stock",
    message: "Purple Axolotl T-Shirt has only 5 items left",
    timestamp: new Date(),
    read: false
  }
];

<NotificationCenter 
  notifications={notifications}
  onMarkAsRead={(id) => console.log('Mark as read:', id)}
  onDismiss={(id) => console.log('Dismiss:', id)}
/>
```

### 9. **BackToTop**
```tsx
// Already imported in App.tsx - appears automatically when scrolled down
// No props needed - works globally
```

### 10. **Breadcrumbs**
```tsx
import { Breadcrumbs } from '@/components/Breadcrumbs';

<Breadcrumbs 
  items={[
    { label: "Shop", href: "/shop" },
    { label: "T-Shirts", href: "/shop?category=tshirt" },
    { label: "Purple Axolotl T-Shirt" }
  ]}
/>
```

---

## Integration Checklist

### For Product Pages:
- [ ] Add ProductGallery component
- [ ] Add ProductComparison to related products
- [ ] Use Breadcrumbs for navigation

### For Admin Dashboard:
- [ ] All features already integrated in Admin.tsx
- [ ] To add new pages, use the same pattern in Admin.tsx
- [ ] Import from AdminSidebar.tsx for navigation items

### For Admin Pages:
- [ ] Add new navigation item in AdminSidebar.tsx
- [ ] Create new page component
- [ ] Add route logic in Admin.tsx
- [ ] Update getPageTitle() function

### For Customer Loyalty:
- [ ] Fetch loyalty stats from `/api/user/loyalty`
- [ ] Display LoyaltyProgram component in user profile
- [ ] Update points on order completion

### For Notifications:
- [ ] Fetch notifications from `/api/notifications`
- [ ] Use NotificationCenter in Header
- [ ] Connect to WebSocket for real-time updates

### For Email:
- [ ] Set environment variables for SMTP credentials
- [ ] Test with EmailServiceConfig
- [ ] Update emailService.ts to send real emails
- [ ] Update API endpoints to trigger emails

---

## Database Schema Needed

### For Audit Logs:
```sql
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY,
  action TEXT,
  entity_type TEXT,
  entity_id TEXT,
  entity_name TEXT,
  admin_id UUID,
  admin_name TEXT,
  changes JSONB,
  ip_address TEXT,
  timestamp TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id)
);
```

### For Loyalty Points:
```sql
CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY,
  user_id UUID,
  points INT,
  transaction_type TEXT,
  order_id UUID,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### For Notifications:
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID,
  type TEXT,
  title TEXT,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## API Endpoints to Create

### Loyalty:
- `GET /api/user/loyalty` - Get loyalty stats
- `POST /api/loyalty/redeem` - Redeem rewards

### Notifications:
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### Audit Logs (Admin):
- `GET /api/admin/audit-logs` - Get all audit logs
- `GET /api/admin/audit-logs/:entityId` - Get logs for entity

### Email:
- `POST /api/email/test` - Send test email
- `POST /api/email/newsletter` - Send newsletter

### Import:
- `POST /api/admin/import/products` - Bulk import products
- `GET /api/admin/import/status/:jobId` - Get import status

---

## Testing Checklist

### Desktop:
- [ ] Product comparison on desktop
- [ ] Admin dashboard on desktop
- [ ] Dark mode on desktop
- [ ] Notification center on desktop

### Mobile:
- [ ] Product gallery on mobile
- [ ] Breadcrumbs on mobile
- [ ] Admin sidebar toggle
- [ ] Back to top button
- [ ] Loyalty program display

### Responsiveness:
- [ ] Tablet layout (768px)
- [ ] Mobile layout (375px)
- [ ] Landscape orientation
- [ ] All components work at all sizes

### Dark Mode:
- [ ] All components render correctly
- [ ] Text contrast is sufficient
- [ ] Colors are appropriate
- [ ] Images look good

---

## Common Issues & Solutions

### Issue: Product Comparison not showing
**Solution**: Make sure selected products array is not empty

### Issue: Notifications not appearing
**Solution**: Ensure NotificationCenter is added to Header, pass notifications array

### Issue: CSV import fails
**Solution**: Check CSV format matches template, ensure required columns present

### Issue: Dark mode colors off
**Solution**: Clear browser cache, check Tailwind CSS dark mode is enabled in tailwind.config.ts

### Issue: Back to top not showing
**Solution**: Must be imported in App.tsx, needs scroll to trigger

---

## Performance Tips

1. **Product Comparison**: Memoize product list to prevent unnecessary re-renders
2. **Notifications**: Use pagination for large notification lists
3. **Audit Logs**: Filter by date range to reduce data
4. **Loyalty Program**: Cache loyalty stats with React Query
5. **Product Gallery**: Lazy load images below fold

---

## Accessibility

All components follow WCAG 2.1 AA standards:
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Color contrast ratios
- ✅ ARIA labels
- ✅ Focus indicators
- ✅ Reduced motion support

---

## Next Steps

1. **Connect to Backend**: Update API endpoints to connect components to server
2. **Test with Real Data**: Replace mock data with actual API calls
3. **Add More Features**: Use these as templates for additional features
4. **Monitor Performance**: Use React Query DevTools to check query efficiency
5. **Gather Feedback**: Test with real users

---

## Support

For issues or questions:
1. Check the component source code comments
2. Review Tailwind CSS documentation
3. Check React Query documentation
4. Review TypeScript types for correct props

---

**Happy coding! 🚀**

