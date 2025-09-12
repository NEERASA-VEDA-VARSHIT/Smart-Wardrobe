import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
  try {
    console.log('🔄 Creating Supabase bucket...');
    
    const { data, error } = await supabase.storage.createBucket('wardrobe-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Bucket "wardrobe-images" already exists');
        return;
      }
      throw error;
    }

    console.log('✅ Bucket "wardrobe-images" created successfully');
    console.log('📋 Bucket configuration:');
    console.log('   - Public: true');
    console.log('   - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif');
    console.log('   - File size limit: 5MB');
    
  } catch (error) {
    console.error('❌ Error creating bucket:', error.message);
    console.log('\n🔧 Manual setup instructions:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to Storage');
    console.log('3. Create a new bucket named "wardrobe-images"');
    console.log('4. Set it to public');
    console.log('5. Configure allowed MIME types for images');
    process.exit(1);
  }
}

createBucket();
