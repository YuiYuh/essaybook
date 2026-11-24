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
  {
    meaning: '认为',
    aliases: ['观点', '主张', '看法', '相信', 'think', 'believe', 'argue', 'view'],
    groups: [
      {
        id: 'take-a-view',
        label: '表达观点与主张',
        keywords: ['表达观点', '阐述看法', '个人观点'],
        entries: [
          ['argue that', '提出一个可以论证的观点，后接完整从句', 'Some educators argue that outdoor classes give students more opportunities to cooperate.'],
          ['take the view that', '持有某种看法，适合较正式的论述', 'I take the view that schools should teach financial literacy.'],
          ['maintain that', '在有不同意见时仍坚持认为', 'Critics maintain that the plan would place too much pressure on small businesses.'],
          ['be convinced that', '深信某事，语气比 think 更强', 'I am convinced that regular feedback helps students become more independent learners.'],
        ],
      },
    ],
  },
  {
    meaning: '支持',
    aliases: ['赞成', '赞同', '认可', 'support', 'approve of', 'endorse', 'favour', 'favor'],
    groups: [
      {
        id: 'support-a-plan',
        label: '支持观点、政策或方案',
        keywords: ['支持方案', '赞成某项措施', '支持某个观点'],
        entries: [
          ['be in favour of', '赞成某方案，后接名词或动名词', 'Many residents are in favour of extending weekend bus services.'],
          ['endorse a proposal', '公开认可一项提案，主语常为个人或机构', 'The student council endorsed a proposal to keep the library open later.'],
          ['make a case for', '提出理由支持某事，强调论证过程', 'The findings make a case for investing in rural internet access.'],
          ['support the idea of', '支持某一想法，of 后接名词或动名词', 'I support the idea of giving pupils more time for independent reading.'],
        ],
      },
    ],
  },
  {
    meaning: '反对',
    aliases: ['质疑', '有异议', '不赞成', 'oppose', 'object', 'sceptical', 'skeptical'],
    groups: [
      {
        id: 'disagree-with-a-plan',
        label: '反对措施或提出疑问',
        keywords: ['反对提案', '提出顾虑', '持怀疑态度'],
        entries: [
          ['oppose a proposal', '明确反对一项提案，oppose 直接接宾语', 'Local residents opposed a proposal to close the community centre.'],
          ['object to', '反对某事，to 后接名词或动名词', 'Several parents objected to replacing all printed textbooks with tablets.'],
          ['raise concerns about', '对某事提出具体顾虑，适合语气克制的论述', 'Teachers raised concerns about the privacy of student data.'],
          ['question whether', '质疑某事是否成立或可行，后接完整从句', 'We should question whether a higher fee would actually improve the service.'],
        ],
      },
    ],
  },
  {
    meaning: '显著',
    aliases: ['明显', '大幅', '显而易见', 'substantial', 'marked', 'noticeable', 'considerable', 'significantly'],
    groups: [
      {
        id: 'magnitude',
        label: '写变化幅度和明显差异',
        keywords: ['显著增加', '显著变化', '明显差异', '大幅增长', '明显高于'],
        entries: [
          ['a marked increase in', '某项指标明显上升，适合描述图表', 'There was a marked increase in cycle use after the new lanes opened.'],
          ['a substantial rise in', '某项指标大幅上升，强调变化量较大', 'The figures show a substantial rise in demand for evening courses.'],
          ['a noticeable difference', '容易看出的差异，适合比较两组', 'There was a noticeable difference between the response rates for the two age groups.'],
          ['considerably higher than', '明显高于可比对象，写清两边比较的是什么', 'The participation rate among first-year students was considerably higher than that among final-year students.'],
          ['well above', '远高于参考值或基线，后接数值或基准', 'Attendance remained well above its pre-pandemic level throughout the year.'],
        ],
      },
    ],
  },
  {
    meaning: '大约',
    aliases: ['约为', '约占', '接近', '差不多', 'roughly', 'approximately', 'about', 'nearly'],
    groups: [
      {
        id: 'approximation',
        label: '表达约数、接近和略高略低',
        keywords: ['大约一半', '略低于', '略高于', '接近一半', '约数'],
        entries: [
          ['roughly one in three', '大约三人中有一人，适合比例接近三分之一时', 'Roughly one in three respondents preferred online appointments.'],
          ['approximately', '约、大约，较正式，后面常接数字或时间', 'The number of visitors reached approximately 8,000 in June.'],
          ['just under', '略低于某个数值，方向明确', 'Just under 40% of students travelled to campus by bus.'],
          ['slightly over', '略高于某个数值，也可用 just over', 'Slightly over half of the respondents chose the lower-cost option.'],
          ['close to half', '接近一半，适合想强调大致比例时', 'Close to half of the households surveyed owned at least one bicycle.'],
        ],
      },
    ],
  },
  {
    meaning: '缺乏',
    aliases: ['不足', '短缺', '匮乏', '不够', 'lack', 'shortage', 'insufficient', 'scarcity'],
    groups: [
      {
        id: 'shortage',
        label: '写资源不足、机会受限或未达标',
        keywords: ['经费不足', '人手短缺', '机会不足', '未达到要求'],
        entries: [
          ['a lack of', '缺少某物，适用于资源、经验或意识', 'A lack of reliable information can make it difficult for students to choose a career.'],
          ['a shortage of', '供应短缺，常用于人员、住房和物资', 'A shortage of qualified volunteers delayed the launch of the programme.'],
          ['limited access to', '获得某种服务或资源的途径受限', 'Students in remote areas may have limited access to public libraries.'],
          ['fall short of', '没有达到目标、要求或预期', 'The number of sign-ups fell short of the organisers’ target.'],
          ['insufficient funding', '经费不足，适合说明项目受到的限制', 'Insufficient funding prevented the school from running the workshop every week.'],
        ],
      },
    ],
  },
  {
    meaning: '获得',
    aliases: ['获取', '赢得', '取得', '掌握', 'gain', 'acquire', 'obtain', 'earn'],
    groups: [
      {
        id: 'gain-resources',
        label: '获得资源、掌握技能或赢得信任',
        keywords: ['获得资金', '掌握技能', '赢得信任', '获得机会', '获取资源'],
        entries: [
          ['gain access to', '获得使用资源或服务的机会', 'Through the scheme, rural students can gain access to online courses.'],
          ['acquire new skills', '通过学习或经历获得新技能', 'Students acquire new skills by taking responsibility for different tasks in the project.'],
          ['secure funding', '成功争取到经费，适用于项目或机构', 'The committee secured funding for a new study space.'],
          ['earn public trust', '通过行动逐步赢得公众信任', 'Publishing independent test results can help manufacturers earn public trust.'],
        ],
      },
    ],
  },
  {
    meaning: '提供',
    aliases: ['给予', '供给', '保障', '供人使用', 'provide', 'offer', 'supply'],
    groups: [
      {
        id: 'provide-resources',
        label: '提供服务、支持或使用机会',
        keywords: ['提供帮助', '提供资源', '保障机会', '保障公平', '提供支持'],
        entries: [
          ['provide access to', '提供使用某资源的途径，主语通常为机构或措施', 'The new platform provides access to course materials outside school hours.'],
          ['make materials available to', '让某群体能够取得或使用资料', 'Universities should make learning materials available to students with limited internet access.'],
          ['ensure equal access to', '确保不同群体有平等的使用机会', 'Public funding can help ensure equal access to basic health services.'],
          ['offer practical support to', '向某群体提供实际支持', 'The programme offers practical support to graduates looking for their first job.'],
        ],
      },
    ],
  },
  {
    meaning: '利用',
    aliases: ['使用', '充分利用', '善用', '借助', 'use', 'make use of', 'draw on'],
    groups: [
      {
        id: 'use-resources',
        label: '利用机会、资料和既有资源',
        keywords: ['利用资源', '利用机会', '借鉴经验', '用好时间'],
        entries: [
          ['make use of', '利用已有工具、资源或空间', 'Schools can make use of empty classrooms for after-school activities.'],
          ['take advantage of an opportunity', '借助有利机会做某事', 'Students should take advantage of the opportunity to learn from visiting researchers.'],
          ['draw on local expertise', '借助本地专业知识，draw on 也可接经验或研究成果', 'The project drew on local expertise to develop a more practical design.'],
          ['put spare time to good use', '把空闲时间用在有意义的事情上，也可换成资源或技能', 'Volunteering is one way to put spare time to good use.'],
        ],
      },
    ],
  },
  {
    meaning: '实施',
    aliases: ['落实', '推行', '执行', '实行', '实施措施', 'implement', 'enforce', 'carry out'],
    groups: [
      {
        id: 'put-a-plan-into-action',
        label: '落实方案、推出措施或执行规则',
        keywords: ['落实政策', '执行规则', '落地方案', '推行计划', '逐步实施'],
        entries: [
          ['implement a policy', '实施一项已经确定的政策，适合正式写作', 'The university will implement the policy at the start of the next academic year.'],
          ['put a plan into practice', '把计划转化成实际行动', 'The committee needs a clear budget before it can put the plan into practice.'],
          ['introduce a measure', '推出一项措施，强调开始采用', 'The city introduced a measure to reduce congestion near schools.'],
          ['enforce a rule', '确保一条规则得到遵守', 'Library staff enforce the rule against making calls in quiet study areas.'],
          ['phase in a change', '分阶段逐步实施一项变更', 'The department plans to phase in the new timetable over two semesters.'],
        ],
      },
    ],
  },
  {
    meaning: '坚持',
    aliases: ['持之以恒', '毅力', '坚持到底', '继续努力', 'persist', 'persevere', 'perseverance', 'stick with'],
    groups: [
      {
        id: 'keep-going',
        label: '写持续努力、承诺和坚持完成',
        keywords: ['面对挫折坚持', '坚持练习', '保持努力', '坚持做某事'],
        entries: [
          ['persevere in the face of setbacks', '面对挫折仍坚持，适合写个人品质', 'Success often depends on the willingness to persevere in the face of setbacks.'],
          ['stick with a routine', '坚持按既定习惯做事，语气较自然', 'Learners make more progress when they stick with a daily reading routine.'],
          ['remain committed to', '始终致力于某目标，to 后接名词或动名词', 'The team remained committed to improving the service despite the initial difficulties.'],
          ['see a project through', '把一个项目坚持做完，强调有始有终', 'Sharing responsibility makes it easier for students to see a project through.'],
        ],
      },
    ],
  },
  {
    meaning: '权衡',
    aliases: ['取舍', '兼顾', '平衡', '利弊', 'trade-off', 'balance', 'weigh', 'prioritise', 'prioritize'],
    groups: [
      {
        id: 'trade-offs',
        label: '比较取舍并说明优先顺序',
        keywords: ['权衡利弊', '兼顾两方面', '优先考虑', '取得平衡'],
        entries: [
          ['weigh the benefits against the costs', '将收益和成本加以比较', 'Before adopting the new system, schools should weigh the benefits against the costs.'],
          ['involve a trade-off between', '在两个目标之间需要作出取舍', 'The proposal involves a trade-off between convenience and privacy.'],
          ['strike a balance between', '在两方面之间找到平衡', 'Schools need to strike a balance between giving students guidance and letting them work independently.'],
          ['prioritise safety over convenience', '把安全放在便利之前，可替换两个比较项', 'Public transport operators should prioritise safety over convenience.'],
        ],
      },
    ],
  },
  {
    meaning: '图表走势',
    aliases: ['变化趋势', '图表变化'],
    groups: [
      {
        id: 'trend-changes',
        label: '写峰值、回落和波动',
        keywords: ['转折', '拐点', '峰值', '回落', '波动', '达到峰值', '达到顶峰', '先升后降', '在区间内波动', 'peak', 'fluctuate'],
        entries: [
          ['peak at', '在某个数值达到峰值，后接峰值数字', 'The number of visitors peaked at 12,000 in August.'],
          ['fall back to', '从较高水平回落至某值', 'After a brief rise, the figure fell back to 30% in the final year.'],
          ['fluctuate between', '在两个上下界之间波动，后接两个数值', 'Monthly attendance fluctuated between 300 and 500 over the period.'],
        ],
      },
      {
        id: 'changes-in-the-gap',
        label: '写差距缩小或扩大',
        keywords: ['差距', '差距缩小', '差距扩大', '落差', '差距变化', 'gap', 'widen', 'narrow'],
        entries: [
          ['the gap narrowed', '两组之间的差距缩小，差距作主语', 'The gap between the two groups narrowed from 15 to 6 percentage points.'],
          ['the gap widened', '两组之间的差距扩大，差距作主语', 'The gap widened as the figure for urban areas rose faster.'],
        ],
      },
    ],
  },
];
