# Authentication & Authorization Setup Guide

This guide explains how to configure and use the authentication and authorization system in the Torre RPA application.

## Overview

The system implements:
- **SSO Authentication** using Microsoft Azure AD
- **Role-based Authorization** with admin-only dashboard access
- **Form Protection** requiring authentication to fill out forms
- **Centralized Admin Management** through configuration

## Configuration

### 1. Environment Variables

Ensure your `.env` file contains the following Azure AD configuration:

```env
# Azure AD Configuration for SSO
VITE_AAD_CLIENT_ID=your-azure-ad-client-id-here
VITE_AAD_TENANT_ID=your-azure-ad-tenant-id-here

# Optional: Custom redirect URIs (defaults to current origin)
# VITE_AAD_REDIRECT_URI=http://localhost:5173
# VITE_AAD_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
```

### 2. Admin User Configuration

To grant admin access to users, edit `src/config/adminUsers.ts`:

```typescript
export const ADMIN_EMAILS: readonly string[] = [
  'admin@torre-rpa.com',
  'supervisor@torre-rpa.com',
  'manager@torre-rpa.com',
  // Add more admin emails here
] as const;
```

**Important:** Only users whose email addresses are listed in this array will have admin access to the dashboard.

## Authentication Flow

### For Regular Users:
1. User visits `/form` (public form page)
2. System redirects to `/login` if not authenticated
3. User completes Microsoft SSO login
4. System checks if user exists in the form submission database
5. If user has submitted forms before, they can access the form
6. If not, they see a registration message

### For Admin Users:
1. Admin visits any protected route (e.g., `/dashboard`)
2. System redirects to `/login` if not authenticated  
3. Admin completes Microsoft SSO login
4. System checks email against admin configuration
5. Admin gets automatic access even without prior form submissions
6. Admin can access all dashboard features

## Route Protection

### Protected Routes
All routes under `/dashboard/*` require:
- Valid authentication (Microsoft SSO)
- Admin role (email in admin configuration)

### Form Protection
The form at `/form` requires:
- Valid authentication (Microsoft SSO)
- Either existing user registration OR admin status

## User Roles

### Admin Users
- Email must be in `src/config/adminUsers.ts`
- Full dashboard access
- Can view all calls, analytics, and user data
- Can access settings and configuration

### Regular Users
- Must have submitted at least one form to access the system
- Can only access the form submission page
- Cannot access dashboard or admin features

## Development Notes

### Adding New Admin Users
1. Edit `src/config/adminUsers.ts`
2. Add the email address to the `ADMIN_EMAILS` array
3. The system will automatically grant admin privileges on next login

### Testing Authentication
1. Use an email listed in `ADMIN_EMAILS` to test admin features
2. Use any other Microsoft account to test regular user flow
3. Check browser console for MSAL debugging information in development

### Permission System
The system includes a flexible permission framework in `AuthContext`:
- `dashboard:access` - Admin dashboard access
- `calls:view` - View call/ticket data
- `analytics:view` - View analytics data
- `users:view` - View user data
- `settings:access` - Access settings

## Security Considerations

1. **Client-side Authorization**: Remember that client-side checks are for UX only
2. **Backend Validation**: Always validate permissions on the backend
3. **Admin Email Management**: Keep the admin email list secure and updated
4. **Environment Variables**: Never commit actual Azure AD credentials to version control

## Troubleshooting

### Common Issues

1. **"VITE_AAD_CLIENT_ID environment variable is required"**
   - Ensure your `.env` file contains the Azure AD configuration
   - Check that the file is in the frontend root directory

2. **"User not found in system"**
   - User needs to submit a form first, OR
   - Add user's email to the admin configuration

3. **"Access Denied" for expected admin users**
   - Check that the email exactly matches what's in `adminUsers.ts`
   - Email comparison is case-insensitive

4. **Login redirect loops**
   - Verify Azure AD app registration redirect URIs
   - Check that `redirectUri` in config matches your domain

## Support

For additional support with authentication setup:
1. Check the browser console for MSAL errors
2. Verify Azure AD app registration configuration
3. Ensure all environment variables are properly set
4. Test with a known admin email first