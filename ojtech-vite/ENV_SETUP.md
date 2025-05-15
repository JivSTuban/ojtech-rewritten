# Environment Variables Setup

This project requires Supabase credentials to be set up in a `.env` file. Follow these steps to set up your environment:

## Setting Up Environment Variables

1. Create a new file named `.env` in the root directory of the project (same level as `package.json`)

2. Add the following variables to your `.env` file:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Replace the placeholder values with your actual Supabase project URL and anonymous key.

4. Restart the development server if it's already running.

## Where to Find Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Project Settings → API
4. You'll find your project URL and anon/public key there

## Important Notes

- Never commit your `.env` file to version control
- The `.env` file is already included in `.gitignore`
- For production, set these environment variables in your hosting platform 