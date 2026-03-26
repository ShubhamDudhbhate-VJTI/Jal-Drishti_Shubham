// Check sub-district codes and villages mapping
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://reaubfkawbovjhpurtbx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlYXViZmthd2JvdmpocHVydGJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MTAwMDMsImV4cCI6MjA5MDA4NjAwM30.64igBjud8qczrwK1k51bJdJoPHqntwWZ2cjbw2lhQfA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMapping() {
    console.log('🗂️ CHECKING SUB-DISTRICT & VILLAGE MAPPING');
    console.log('==========================================');
    
    try {
        // Get all sub-districts with their codes
        const { data: subDistricts, error: subError } = await supabase
            .from('mh_subdistricts')
            .select('subdistrict_code, subdistrict_name, district_name')
            .eq('district_name', 'Pune')
            .limit(10);
        
        if (subError) {
            console.error('❌ Sub-districts error:', subError.message);
            return;
        }
        
        console.log('\n📋 Pune sub-districts:');
        subDistricts.forEach((sd, i) => {
            console.log(`   ${i + 1}. ${sd.subdistrict_name} (code: ${sd.subdistrict_code})`);
        });
        
        // Get villages for these sub-districts
        console.log('\n🔍 Checking villages for these sub-districts:');
        
        for (const sd of subDistricts.slice(0, 3)) {
            const { data: villages, error: villageError } = await supabase
                .from('mh_villages')
                .select('village_name, subdistrict_code')
                .eq('subdistrict_code', sd.subdistrict_code)
                .limit(3);
            
            if (villageError) {
                console.error(`❌ Villages error for ${sd.subdistrict_name}:`, villageError.message);
            } else {
                console.log(`\n📍 ${sd.subdistrict_name} (${sd.subdistrict_code}):`);
                if (villages.length === 0) {
                    console.log('   ⚠️  No villages found');
                } else {
                    villages.forEach((v, i) => {
                        console.log(`   ${i + 1}. ${v.village_name}`);
                    });
                }
            }
        }
        
        // Get some sample village sub-district codes
        const { data: sampleVillages, error: sampleError } = await supabase
            .from('mh_villages')
            .select('subdistrict_code')
            .limit(5);
        
        if (sampleError) {
            console.error('❌ Sample villages error:', sampleError.message);
        } else {
            console.log('\n📊 Sample village sub-district codes:');
            const codes = [...new Set(sampleVillages.map(v => v.subdistrict_code))];
            codes.forEach(code => {
                console.log(`   • ${code}`);
            });
        }
        
    } catch (err) {
        console.error('❌ Connection error:', err.message);
    }
}

checkMapping();
