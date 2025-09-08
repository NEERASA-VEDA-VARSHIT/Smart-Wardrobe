# 🚀 Supabase Storage Setup Guide

## 📋 Prerequisites
- Supabase project URL: `https://nqyoczcowkrvrchqktpx.supabase.co`
- SUPABASE_KEY configured in backend `.env` file

## 🗂️ Step 1: Create Storage Bucket

### 1.1 Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project

### 1.2 Navigate to Storage
1. In the left sidebar, click **"Storage"**
2. Click **"New bucket"**

### 1.3 Configure Bucket
- **Bucket name**: `wardrobe-images`
- **Public bucket**: ✅ **Enable** (this allows direct image access)
- **File size limit**: `5 MB`
- **Allowed MIME types**: 
  - `image/jpeg`
  - `image/png` 
  - `image/webp`
  - `image/gif`

### 1.4 Create Bucket
Click **"Create bucket"**

## 🔐 Step 2: Configure Row Level Security (RLS)

### 2.1 Enable RLS
1. Go to **Storage** → **Policies**
2. Find your `wardrobe-images` bucket
3. Click **"Enable RLS"**

### 2.2 Create Public Read Policy
1. Click **"New Policy"**
2. Choose **"For full customization"**
3. Use this SQL:

```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'wardrobe-images');
```

### 2.3 Create Upload Policy
1. Click **"New Policy"** again
2. Choose **"For full customization"**
3. Use this SQL:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'wardrobe-images' 
  AND auth.role() = 'authenticated'
);
```

### 2.4 Create Delete Policy
1. Click **"New Policy"** again
2. Choose **"For full customization"**
3. Use this SQL:

```sql
-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'wardrobe-images' 
  AND auth.role() = 'authenticated'
);
```

## ✅ Step 3: Test the Setup

### 3.1 Start Backend Server
```bash
cd backend
node index.js
```

### 3.2 Test Upload
1. Go to your frontend application
2. Try uploading a new clothing item
3. Check that the image appears correctly

### 3.3 Verify in Supabase
1. Go to **Storage** → **wardrobe-images**
2. You should see uploaded images in the `clothes/` folder

## 🚨 Troubleshooting

### Issue: "Bucket not accessible"
**Solution**: Make sure the bucket is created and public access is enabled

### Issue: "Upload failed"
**Solution**: Check RLS policies are correctly configured

### Issue: "Images not displaying"
**Solution**: Verify the bucket is public and images are in the correct folder structure

### Issue: "Permission denied"
**Solution**: Ensure RLS policies allow authenticated users to upload/delete

## 📁 Expected Folder Structure
```
wardrobe-images/
└── clothes/
    ├── 1703123456789-abc123.jpg
    ├── 1703123456790-def456.png
    └── ...
```

## 🔗 Public URL Format
Images will be accessible at:
```
https://nqyoczcowkrvrchqktpx.supabase.co/storage/v1/object/public/wardrobe-images/clothes/filename.jpg
```

## ✨ Benefits
- ✅ Cloud-hosted images with CDN
- ✅ Automatic scaling and reliability
- ✅ Professional image management
- ✅ Global fast loading
- ✅ Cost-effective storage

---

**Need help?** Check the Supabase documentation or contact support.
