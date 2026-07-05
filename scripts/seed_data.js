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
  console.log('=== 获取现有用户ID ===\n');
  const usersResult = await supabaseRequest('GET', '/users?select=id,nickname,role');
  const users = usersResult.data;
  console.log('现有用户:');
  users.forEach(u => console.log(`   ${u.id} - ${u.nickname} (${u.role})`));

  const captainIds = users.filter(u => u.role === 'captain').map(u => u.id);
  console.log(`\n队长ID: ${captainIds}`);

  const projects = [
    { title: '智慧校园垃圾分类系统', description: '基于图像识别的智能垃圾分类系统，利用深度学习算法实现垃圾自动分类', competition_type: '人工智能', captain_id: captainIds[0], required_skills: ['Python', '机器学习', '深度学习'], status: '招募中', team_members: [] },
    { title: '在线教育平台', description: '面向大学生的在线学习平台，支持直播授课、课程回放、在线答疑等功能', competition_type: 'Web开发', captain_id: captainIds[1], required_skills: ['React', 'Node.js', 'MongoDB'], status: '招募中', team_members: [] },
    { title: '智能家居控制中心', description: '物联网智能家居控制平台，支持远程控制、语音交互、场景联动', competition_type: '嵌入式', captain_id: captainIds[2], required_skills: ['C/C++', '物联网', 'MQTT'], status: '招募中', team_members: [] },
    { title: '电商数据分析系统', description: '基于大数据的电商销售数据分析平台，提供可视化报表和智能预测', competition_type: '大数据', captain_id: captainIds[0], required_skills: ['Python', 'Spark', 'SQL'], status: '规划中', team_members: [] },
    { title: '医疗影像辅助诊断系统', description: '利用AI技术辅助医生进行医学影像诊断，提高诊断准确率', competition_type: '人工智能', captain_id: captainIds[1], required_skills: ['PyTorch', '计算机视觉', '医学影像'], status: '招募中', team_members: [] },
    { title: '校园二手交易平台', description: '面向高校学生的二手物品交易平台，支持发布、搜索、交流等功能', competition_type: 'Web开发', captain_id: captainIds[2], required_skills: ['Vue.js', 'Spring Boot', 'MySQL'], status: '规划中', team_members: [] },
  ];

  console.log('\n=== 插入项目数据 ===');
  for (const project of projects) {
    try {
      const result = await supabaseRequest('POST', '/projects', project);
      if (result.status === 201 || result.status === 200) {
        console.log(`   ✓ ${project.title}`);
      } else {
        console.log(`   ✗ ${project.title}: ${JSON.stringify(result.data)}`);
      }
    } catch (e) {
      console.log(`   ✗ ${project.title}: ${e.message}`);
    }
  }

  console.log('\n=== 数据插入完成 ===');
}

run().catch(console.error);
