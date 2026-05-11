# CareRelay Admin Setup

CareRelay platform admin tools are available only to users whose `public.profiles.platform_role` is `founder` or `admin`.

## Find a User UUID

In Supabase Dashboard:

1. Go to Authentication > Users.
2. Search by email.
3. Copy the user UUID.

SQL fallback:

```sql
select id, email
from auth.users
where email = 'founder@email.com';
```

## Find a Care Circle UUID

```sql
select id, name, owner_id, created_at
from public.care_circles
order by created_at desc;
```

## Make a Founder and Care Circle Owner

Run from your local machine or server environment with these variables set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Command:

```bash
npm run make-owner -- --email "founder@email.com" --care-circle-id "care-circle-uuid" --platform-founder true
```

The script:

- finds the Supabase Auth user by email
- ensures a profile row exists
- sets `profiles.platform_role = 'founder'` only when `--platform-founder true` is provided
- sets `care_circles.owner_id`
- inserts or updates the matching `family_members` row as `role = 'owner'`
- prints only safe identifiers and never prints secrets

## Make a Platform Admin Manually

Founder:

```sql
update public.profiles
set platform_role = 'founder', updated_at = now()
where id = 'user-uuid';
```

Admin:

```sql
update public.profiles
set platform_role = 'admin', updated_at = now()
where id = 'user-uuid';
```

Remove platform admin access:

```sql
update public.profiles
set platform_role = 'user', updated_at = now()
where id = 'user-uuid';
```

## Set Care Circle Owner Manually

```sql
update public.care_circles
set owner_id = 'user-uuid', updated_at = now()
where id = 'care-circle-uuid';

insert into public.family_members (
  care_circle_id,
  user_id,
  name,
  email,
  role,
  status,
  invite_status,
  permission_level,
  updated_at
)
values (
  'care-circle-uuid',
  'user-uuid',
  'Owner',
  'founder@email.com',
  'owner',
  'active',
  'joined',
  'admin',
  now()
);
```

If a family member row already exists, update it instead of inserting a duplicate.

## Safety Notes

- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Do not use user-editable metadata for platform authorization.
- `/admin` does not expose hard-delete user actions.
- Only a current `founder` can make another user a platform admin from the admin UI.
