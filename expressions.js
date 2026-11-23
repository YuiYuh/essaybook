/* General-purpose writing expressions. Personal materials are loaded separately. */
const WRITING_EXPRESSIONS = [
  {
    meaning: '提高',
    aliases: ['提升', '改进', '改善', 'improve', 'enhance', 'boost', 'raise', 'strengthen'],
    groups: [
      {
        id: 'improve-verbs',
        label: '常用替换动词',
        keywords: [],
        entries: [
          ['improve', '通用的「提高、改善」，常搭配质量、效率和表现', 'Regular feedback can improve the quality of students’ work.'],
          ['enhance', '提升现有质量、效果或体验，较正式', 'Clear diagrams enhance the reader’s understanding of the topic.'],
          ['boost', '有力地推动增长，常搭配产出、销量和信心', 'A successful trial can boost public confidence in the service.'],
          ['raise', '把数值、标准或意识提高，常搭配费率和标准', 'The city raised parking fees to reduce traffic in the centre.'],
          ['strengthen', '增强能力、制度或保障', 'Better training can strengthen the ability of staff to handle complaints.'],
        ],
      },
      {
        id: 'efficiency',
        label: '提高效率与产出',
        keywords: ['提升效率', '提高生产力', '提升生产力', '提高生产率', '提高工作效率', '提升工作效率', 'efficiency', 'productivity'],
        entries: [
          ['improve efficiency', '提高效率，通用写法', 'Digital tools can improve efficiency in the workplace.'],
          ['boost productivity', '提高生产力或人均产出', 'Flexible working hours can boost productivity.'],
          ['streamline the process', '简化流程以提高效率', 'Online registration can streamline the application process.'],
        ],
      },
      {
        id: 'quality',
        label: '提高质量与标准',
        keywords: ['提高质量', '提升质量', '改善质量', '提高标准', '提升标准', 'quality', 'standards'],
        entries: [
          ['enhance the quality of', '提升某事物的质量，后接名词', 'Timely feedback can enhance the quality of students’ writing.'],
          ['raise standards', '提高标准，适合教育或服务语境', 'Regular inspections can help raise safety standards.'],
          ['deliver better outcomes', '取得更好的结果，强调实际成效', 'Early intervention can deliver better educational outcomes.'],
        ],
      },
      {
        id: 'skills',
        label: '提高能力与表现',
        keywords: ['提高能力', '提升能力', '增强能力', '提高技能', '提高水平', '提升水平', '提高成绩', '提高表现', 'skills', 'performance'],
        entries: [
          ['strengthen one’s ability to', '增强做某事的能力，后接动词原形', 'Group projects strengthen students’ ability to work in teams.'],
          ['hone one’s skills', '通过练习磨练已有技能', 'Volunteering allows young people to hone their communication skills.'],
          ['improve performance', '改善工作、学习或比赛表现', 'Regular practice helps students improve their academic performance.'],
        ],
      },
      {
        id: 'numbers',
        label: '提高数值与比例',
        keywords: ['提高数值', '提高比率', '提高比例', '提高收入', '提升收入', '提高参与率', '提高分数', 'increase', 'rate'],
        entries: [
          ['increase participation', '增加参与人数或参与程度', 'Lower fees can increase participation in sports programmes.'],
          ['raise the participation rate', '提高参与率，强调比例', 'The school aims to raise the participation rate from 40% to 60%.'],
          ['boost household incomes', '提高家庭收入，强调推动作用', 'Skills training can help boost household incomes.'],
        ],
      },
      {
        id: 'awareness',
        label: '提高意识与认识',
        keywords: ['提升意识', '增强意识', '加强意识', '提高认识', '提升认识', 'awareness'],
        entries: [
          ['raise awareness of', '提高对某个问题的认识', 'The campaign aims to raise awareness of food waste.'],
          ['deepen one’s understanding of', '加深对某事的理解', 'Reading widely deepens students’ understanding of other cultures.'],
        ],
      },
    ],
  },
  {
    meaning: '减少',
    aliases: ['降低', '削减', '减轻', '缓解', 'reduce', 'decrease', 'cut'],
    groups: [
      {
        id: 'reduce',
        label: '减少、降低与缓解',
        keywords: ['减少浪费', '降低成本', '减少排放', '缓解压力', '减轻负担', '缓解拥堵', '降低风险'],
        entries: [
          ['cut down on waste', '减少浪费，强调改变使用习惯', 'Meal planning helps families cut down on food waste.'],
          ['bring down costs', '降低成本或价格', 'Shared facilities can bring down operating costs.'],
          ['ease traffic congestion', '缓解交通拥堵', 'More frequent buses could ease traffic congestion.'],
          ['alleviate the burden on', '减轻某人或机构的负担', 'Affordable childcare can alleviate the financial burden on working parents.'],
          ['mitigate the risk of', '降低某种风险，较正式', 'Regular maintenance can mitigate the risk of equipment failure.'],
        ],
      },
    ],
  },
  {
    meaning: '促进',
    aliases: ['推动', '鼓励', '带动', '提倡', 'promote', 'foster', 'encourage', 'facilitate'],
    groups: [
      {
        id: 'promote',
        label: '促进发展、合作与参与',
        keywords: ['促进创新', '促进合作', '促进发展', '推动进步', '促进增长', '促进交流'],
        entries: [
          ['foster innovation', '培育创新，强调创造有利环境', 'Access to research funding can foster innovation.'],
          ['facilitate cooperation', '为合作创造便利条件', 'Open communication can facilitate cooperation between departments.'],
          ['drive economic growth', '推动经济增长，强调驱动力', 'Investment in infrastructure can drive economic growth.'],
          ['encourage active participation', '鼓励积极参与', 'Group discussions encourage active participation in class.'],
          ['promote sustainable development', '促进可持续发展', 'Cleaner energy can promote sustainable development.'],
        ],
      },
    ],
  },
  {
    meaning: '重要',
    aliases: ['关键', '必要', '不可或缺', '重视', '重要性', 'important', 'essential', 'crucial', 'significant'],
    groups: [
      {
        id: 'importance',
        label: '强调重要性',
        keywords: ['发挥作用', '起重要作用', '关键作用', '非常重要', '重中之重'],
        entries: [
          ['play a vital role in', '在某事中发挥重要作用，后接名词或动名词', 'Public libraries play a vital role in expanding access to information.'],
          ['be essential to', '对某事必不可少', 'Trust is essential to effective collaboration.'],
          ['be crucial for', '对某个对象或目标至关重要', 'Access to clean water is crucial for public health.'],
          ['attach great importance to', '高度重视某件事，主语通常是人或机构', 'Schools should attach great importance to students’ well-being.'],
          ['be a key factor in', '是影响结果的一个关键因素', 'Sleep is a key factor in academic performance.'],
        ],
      },
    ],
  },
  {
    meaning: '导致',
    aliases: ['造成', '引发', '源于', '由于', '归因于', 'lead to', 'result in', 'cause', 'contribute to'],
    groups: [
      {
        id: 'cause',
        label: '表达原因与结果',
        keywords: ['产生影响', '导致问题', '造成后果', '其原因是'],
        entries: [
          ['lead to', '导致某种结果，后接名词或动名词', 'Poor planning can lead to unnecessary delays.'],
          ['give rise to', '引发问题或新现象，较正式', 'Rapid growth can give rise to housing shortages.'],
          ['contribute to', '是促成某结果的部分原因', 'A lack of exercise can contribute to poor health.'],
          ['stem from', '源于某事，主语是结果', 'Many misunderstandings stem from unclear instructions.'],
          ['be attributed to', '被归因于某个因素，主语是结果', 'The decline can be attributed to higher costs.'],
        ],
      },
    ],
  },
  {
    meaning: '解决',
    aliases: ['应对', '处理', '克服', '采取措施', 'address', 'tackle', 'solve', 'deal with'],
    groups: [
      {
        id: 'solutions',
        label: '应对问题与挑战',
        keywords: ['解决问题', '应对挑战', '解决争议', '解决困难'],
        entries: [
          ['address the issue of', '着手处理某个问题', 'The new policy addresses the issue of unequal access to education.'],
          ['tackle the root causes of', '处理某事的根本原因', 'Job training can help tackle the root causes of long-term unemployment.'],
          ['respond to the challenge of', '应对某一挑战', 'Cities must respond to the challenge of population ageing.'],
          ['take steps to', '采取措施做某事，后接动词原形', 'Universities can take steps to make courses more accessible.'],
          ['overcome barriers to', '克服妨碍某事的障碍', 'Scholarships help students overcome financial barriers to higher education.'],
        ],
      },
    ],
  },
  {
    meaning: '影响',
    aliases: ['作用', '后果', '冲击', 'affect', 'impact', 'influence', 'effect'],
    groups: [
      {
        id: 'impact',
        label: '说明影响及其程度',
        keywords: ['积极影响', '负面影响', '深远影响', '长期影响'],
        entries: [
          ['have a lasting effect on', '对某人或某事产生持久影响', 'Early experiences can have a lasting effect on children’s confidence.'],
          ['shape public attitudes towards', '塑造公众对某事的态度', 'News coverage can shape public attitudes towards new technology.'],
          ['have an adverse impact on', '对某事产生不利影响', 'Noise pollution can have an adverse impact on sleep quality.'],
          ['undermine public trust', '逐渐削弱公众信任', 'A lack of transparency can undermine public trust.'],
        ],
      },
    ],
  },
  {
    meaning: '有利于',
    aliases: ['有益', '有帮助', '好处', '优势', '有利', 'benefit', 'beneficial', 'advantage'],
    groups: [
      {
        id: 'benefits',
        label: '说明益处与机会',
        keywords: ['带来好处', '创造机会', '提供机会', '提供便利'],
        entries: [
          ['be conducive to', '为某事创造有利条件，后接名词或动名词', 'A quiet environment is conducive to learning.'],
          ['offer lasting benefits to', '给某个群体带来长远益处', 'Preventive care can offer lasting benefits to older adults.'],
          ['open up opportunities for', '为某人创造新机会', 'Remote work can open up opportunities for people in rural areas.'],
          ['make it easier for people to', '让人们更容易做某事，后接动词原形', 'Better public transport makes it easier for people to get to work.'],
        ],
      },
    ],
  },
  {
    meaning: '增加',
    aliases: ['增长', '上升', '上涨', '攀升', 'rise', 'grow', 'increase', 'climb'],
    groups: [
      {
        id: 'growth',
        label: '描述图表中的增长',
        keywords: ['持续上升', '显著增长', '大幅上升', '翻倍', '呈上升趋势', '图表', '增长趋势'],
        entries: [
          ['rise steadily', '稳步上升，主语是数值或比例', 'The share of online sales rose steadily over the period.'],
          ['see a sharp increase in', '某项指标明显上升', 'The city saw a sharp increase in bicycle use after 2022.'],
          ['nearly double', '接近翻倍，即接近原来的两倍', 'The number of visitors nearly doubled in five years.'],
          ['grow by 20%', '增长了 20%，by 后接增幅', 'Household spending grew by 20% over the decade.'],
          ['rise to 60%', '升至 60%，to 后接最终数值', 'The participation rate rose to 60% in 2025.'],
        ],
      },
    ],
  },
  {
    meaning: '下降',
    aliases: ['下跌', '下滑', '下落', '衰退', 'decline', 'fall', 'drop'],
    groups: [
      {
        id: 'decline',
        label: '描述图表中的下降',
        keywords: ['持续下降', '大幅下降', '呈下降趋势', '略有下降', '图表', '下降趋势'],
        entries: [
          ['decline gradually', '逐渐下降，适合图表描述', 'The proportion declined gradually between 2020 and 2025.'],
          ['drop sharply', '急剧下降', 'The unemployment rate dropped sharply in the second half of the year.'],
          ['fall from 40% to 25%', '从 40% 降至 25%，明确写出起点和终点', 'The share of households without internet access fell from 40% to 25%.'],
          ['reach a low of', '降至某段时期的最低值', 'Attendance reached a low of 300 in February.'],
        ],
      },
    ],
  },
  {
    meaning: '越来越多',
    aliases: ['日益', '越来越', '日趋', 'increasingly', 'more and more'],
    groups: [
      {
        id: 'trend',
        label: '描述逐渐扩大的趋势',
        keywords: ['越来越普遍', '日益重视', '越来越受欢迎'],
        entries: [
          ['a growing number of', '越来越多的，后接可数名词复数', 'A growing number of graduates are choosing to work remotely.'],
          ['an increasing share of', '所占比例不断上升', 'An increasing share of households rely on renewable energy.'],
          ['become increasingly common', '变得越来越普遍', 'Online consultations are becoming increasingly common.'],
          ['gain popularity among', '在某群体中越来越受欢迎', 'Cycling has gained popularity among urban commuters.'],
        ],
      },
    ],
  },
  {
    meaning: '表明',
    aliases: ['反映', '体现', '说明', '显示', '揭示', 'show', 'indicate', 'suggest', 'reflect'],
    groups: [
      {
        id: 'evidence',
        label: '引述数据与现象',
        keywords: ['数据显示', '调查表明', '图表显示', '从图表可以看出'],
        entries: [
          ['the figures indicate that', '数据显示，后接完整从句', 'The figures indicate that participation increased across all age groups.'],
          ['suggest that', '提示某种解释或趋势，语气相对谨慎', 'The survey results suggest that cost remains a major concern.'],
          ['reflect a shift towards', '反映出向某种做法或趋势的转变', 'The rise in train travel reflects a shift towards public transport.'],
          ['highlight the need for', '凸显对某项措施的需求', 'The survey highlights the need for better career guidance.'],
        ],
      },
    ],
  },
  {
    meaning: '相比',
    aliases: ['比较', '相对而言', '对比', '差异', 'compare', 'contrast', 'whereas'],
    groups: [
      {
        id: 'comparison',
        label: '对照两组数据或观点',
        keywords: ['与其相比', '相比之下', '相比较', '两者对比'],
        entries: [
          ['compared with', '与某对象相比，后接同类对象', 'Compared with rural residents, urban residents made more trips by train.'],
          ['by contrast', '相比之下，通常置于下一句开头', 'Bus use rose. By contrast, the share of trips made by car fell.'],
          ['whereas', '而，用于连接两个形成对比的分句', 'Train use rose steadily, whereas bus use remained stable.'],
          ['twice as high as', '为对方的两倍，适合比率或水平', 'The rate in cities was twice as high as that in rural areas.'],
        ],
      },
    ],
  },
  {
    meaning: '占比',
    aliases: ['占', '所占比例', '比重', '比例', 'account for', 'make up', 'proportion', 'percentage', 'share'],
    groups: [
      {
        id: 'share',
        label: '写出各部分所占比例',
        keywords: ['占多数', '占一半', '占百分比', '图表'],
        entries: [
          ['account for 40% of', '占总量的 40%', 'Solar power accounts for 40% of local electricity generation.'],
          ['make up nearly half of', '接近总量的一半', 'Part-time students make up nearly half of the total.'],
          ['represent the largest share of', '占某总量中最大的份额', 'Housing represents the largest share of household spending.'],
          ['the proportion of people who', '做某事的人所占的比率，后接动词', 'The proportion of people who cycled to work remained stable.'],
        ],
      },
    ],
  },
  {
    meaning: '保持',
    aliases: ['维持', '稳定', '不变', '平稳', 'maintain', 'remain', 'stable'],
    groups: [
      {
        id: 'maintain',
        label: '描述维持与稳定',
        keywords: ['保持稳定', '维持水平', '保持平衡', '保持不变', '图表'],
        entries: [
          ['remain stable at', '稳定在某个数值，后接数值', 'The unemployment rate remained stable at 5%.'],
          ['remain largely unchanged', '基本保持不变', 'Spending on transport remained largely unchanged.'],
          ['level off at', '经过升降后趋于稳定，后接数值', 'The figure rose at first and then levelled off at 30%.'],
          ['maintain a balance between', '在两个方面之间保持平衡', 'It is important to maintain a balance between work and personal life.'],
        ],
      },
    ],
  },
  {
    meaning: '建议',
    aliases: ['推荐', '提议', '提出建议', 'recommend', 'advise', 'propose', 'suggestion'],
    groups: [
      {
        id: 'recommend',
        label: '提出建议与方案',
        keywords: ['建议信', '提供建议', '建议采取'],
        entries: [
          ['I would recommend doing', '我建议做某事，用实际动名词替换 doing', 'I would recommend visiting the museum on a weekday.'],
          ['it would be advisable to', '建议做某事，后接动词原形', 'It would be advisable to book tickets in advance.'],
          ['one way to address this is to', '解决此事的一种办法是，后接动词原形', 'One way to address this is to offer evening classes.'],
          ['consider taking steps to', '考虑采取措施做某事', 'Schools should consider taking steps to reduce food waste.'],
        ],
      },
    ],
  },
];
