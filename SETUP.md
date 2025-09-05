# rarecube.tv Setup Documentation

## Issues Encountered During Initial Setup

### 1. Environment Configuration
**Issue**: Missing .env file with required credentials
**Solution**: Created .env with all required variables:
- Clerk authentication keys
- MongoDB connection string with database name
- LiveKit streaming configuration
- UploadThing file upload credentials

### 2. Database Connection
**Issue**: MongoDB connection string missing database name
- Error: "Database must be defined in the connection string"
**Solution**: Added `/re-stream` to the connection URL

### 3. Clerk Webhook Setup
**Issue**: User authentication failing because webhooks weren't syncing users to local database
- Error: "User not found" when accessing dashboard
**Solution**: 
- Set up localtunnel for webhook development: `npx localtunnel --port 3000`
- Configured Clerk webhook to point to tunnel URL + `/api/webhooks/clerk`
- Added webhook signing secret to environment

### 4. Webhook Handler Robustness
**Issue**: Webhook failing due to missing email addresses in Clerk payload
- Error: `Cannot read properties of undefined (reading 'email_address')`
**Solution**: Added defensive programming:
```typescript
email: payload.data.email_addresses?.[0]?.email_address || payload.data.primary_email_address?.email_address || "",
username: payload.data.username || "user_" + payload.data.id.slice(-6),
imageUrl: payload.data.image_url || "",
```

### 5. Development Server Restart Required
**Issue**: Environment variables not loading after changes
**Solution**: Restart development server after .env changes

## Final Working Setup

### Running Services
1. **Development Server**: `npm run dev` (http://localhost:3000)
2. **Database**: MongoDB Atlas connection via Prisma
3. **Tunnel**: `npx localtunnel --port 3000` (https://plain-mammals-find.loca.lt)
4. **Database Studio**: `npx prisma studio` (http://localhost:5555)

### Key Commands Used
```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
npx localtunnel --port 3000
npx prisma studio
```

### Working URLs
- **App**: http://localhost:3000
- **Public Webhook**: https://plain-mammals-find.loca.lt/api/webhooks/clerk
- **Database Studio**: http://localhost:5555

## Success Criteria Met
✅ Dependencies installed  
✅ Database connected and schema synced  
✅ Clerk authentication working with user sync  
✅ Webhook endpoints configured and functional  
✅ Development server running without errors  
✅ User registration and dashboard access working