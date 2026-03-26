// Quick test to check villages data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://reaubfkawbovjhpurtbx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlYXViZmthd2JvdmpocHVydGJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MTAwMDMsImV4cCI6MjA5MDA4NjAwM30.64igBjud8qczrwK1k51bJdJoPHqntwWZ2cjbw2lhQfA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testVillages() {
    console.log('🏘️ TESTING VILLAGES DATA');
    console.log('========================');
    
    try {
        // Check total villages count
        const { count, error: countError } = await supabase
            .from('mh_villages')
            .select('*', { count: 'exact', head: true });
        
        if (countError) {
            console.error('❌ Count error:', countError.message);
            return;
        }
        
        console.log(`📊 Total villages in database: ${count || 0}`);
        
        if (count === 0) {
            console.log('⚠️  No villages found in database!');
            console.log('🔧 This is why village dropdown is empty');
            console.log('💡 You need to populate villages data first');
            return;
        }
        
        // Get sample villages
        const { data, error } = await supabase
            .from('mh_villages')
            .select('*')
            .limit(5);
        
        if (error) {
            console.error('❌ Sample error:', error.message);
            return;
        }
        
        console.log('\n📋 Sample villages:');
        data.forEach((v, i) => {
            console.log(`   ${i + 1}. ${v.village_name} (subdistrict: ${v.subdistrict_code})`);
        });
        
        // Test village fetching for a sub-district
        const subDistrictCode = 4193; // Example: Haveli
        console.log(`\n🔍 Testing villages for sub-district ${subDistrictCode}:`);
        
        const { data: subVillages, error: subError } = await supabase
            .from('mh_villages')
            .select('*')
            .eq('subdistrict_code', subDistrictCode)
            .limit(3);
        
        if (subError) {
            console.error('❌ Sub-district error:', subError.message);
        } else {
            console.log(`✅ Found ${subVillages?.length || 0} villages for sub-district ${subDistrictCode}`);
            subVillages?.forEach((v, i) => {
                console.log(`   ${i + 1}. ${v.village_name}`);
            });
        }
        
    } catch (err) {
        console.error('❌ Connection error:', err.message);
    }
}

testVillages();
