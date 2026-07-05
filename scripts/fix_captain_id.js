import https from 'https';

const SUPABASE_KEY = 'sb_publishable_5k9JgLr8RWCVQO_P0tvplA_HU0lLewM';

function supabaseRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'vkuhgdxnblshlvwkmwni.supabase.co',
      path: `/rest/v1${path}`,
      method: method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log('=== 检查项目 captain_id 关联 ===\n');

  const usersResult = await supabaseRequest('GET', '/users?select=id,nickname,role');
  const users = usersResult.data;
  console.log('现有用户:');
  users.forEach(u => console.log(`   ${u.id} - ${u.nickname} (${u.role})`));

  const projectResult = await supabaseRequest('GET', '/projects?select=id,title,captain_id');
  const projects = projectResult.data;
  
  console.log('\n现有项目:');
  let projectsToFix = [];

  for (const project of projects) {
    const captain = users.find(u => u.id === project.captain_id);
    if (captain) {
      console.log(`   ✓ ${project.title} - 队长: ${captain.nickname}`);
    } else {
      console.log(`   ✗ ${project.title} - captain_id: ${project.captain_id} (无效或为空)`);
      projectsToFix.push(project);
    }
  }

  if (projectsToFix.length === 0) {
    console.log('\n所有项目的 captain_id 关联正常！');
    return;
  }

  console.log(`\n需要修复 ${projectsToFix.length} 个项目...`);

  const validUserIds = users.map(u => u.id);
  let fixCount = 0;

  for (const project of projectsToFix) {
    const randomUserId = validUserIds[Math.floor(Math.random() * validUserIds.length)];
    const assignedUser = users.find(u => u.id === randomUserId);
    
    try {
      const result = await supabaseRequest(
        'PATCH', 
        `/projects?id=eq.${project.id}`, 
        { captain_id: randomUserId }
      );
      
      if (result.status === 204 || result.status === 200) {
        console.log(`   ✓ ${project.title} - 已更新为队长: ${assignedUser?.nickname}`);
        fixCount++;
      } else {
        console.log(`   ✗ ${project.title}: 更新失败 - ${JSON.stringify(result.data)}`);
      }
    } catch (e) {
      console.log(`   ✗ ${project.title}: ${e.message}`);
    }
  }

  console.log(`\n=== 修复完成，成功更新 ${fixCount} 个项目 ===`);
}

run().catch(console.error);