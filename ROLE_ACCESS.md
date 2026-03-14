# Role Access Matrix

## Roles
- admin
- manager
- member

## App Navigation
- Dashboard: admin, manager, member
- Patients: admin, manager, member
- Providers: admin, manager, member
- Analytics: admin, manager, member
- Consent: admin, manager, member
- Integrations: admin, manager, member
- Settings: admin, manager, member
- Team Management: admin only

## API Access
- `/api/*` GET: admin, manager, member
- `/api/*` POST: admin, manager
- `/api/*` PATCH: admin, manager
- `/api/*` DELETE: admin only
- `/api/admin/users` GET/PATCH: admin only

## Behavior
- Inactive users cannot access private routes.
- New users default to role `member` and status `active`.
- Admin can change user role/status from Team page.
