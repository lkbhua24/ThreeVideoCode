// src/data/interviewConfig.js
// 情侣采访模式 - 视频内容配置表
// 对应视频文件应存放在 media/sucai/caifang/ 目录下
// 命名规范: 
// - 核心视频: interview_{id}_{keyword}.mp4
// - 切片视频: interview_{id}_slice_{sliceId}_{keyword}.mp4

export const INTERVIEW_TIMELINE = [
  {
    id: 1,
    question: "第一次见面的印象？",
    videoKeyword: "first_meet", // 对应文件名 interview_01_first_meet.mp4
    nodeType: "heart", // 核心节点类型：heart (爱心), star (星星)
    color: "#ff9a9e", // 粉色-女方视角
    duration: 120, // 预计时长(秒)，用于节点大小
    speaker: "Her",
    slices: [
      {
        id: 101,
        title: "尴尬的小插曲",
        videoKeyword: "slice_awkward", // 对应文件名 interview_01_slice_101_awkward.mp4
        nodeType: "bubble", // 切片节点类型
        offset: 30 // 在主视频30秒处关联
      }
    ]
  },
  {
    id: 2,
    question: "什么时候确定的关系？",
    videoKeyword: "official_date",
    nodeType: "heart",
    color: "#a18cd1", // 蓝色-男方视角
    duration: 180,
    speaker: "Him",
    slices: []
  },
  {
    id: 3,
    question: "最感动的一件事",
    videoKeyword: "most_moved",
    nodeType: "heart",
    color: "#ff9a9e",
    duration: 150,
    speaker: "Her",
    slices: [
      {
        id: 301,
        title: "准备惊喜的花絮",
        videoKeyword: "slice_surprise_bts",
        nodeType: "bubble",
        offset: 120
      }
    ]
  },
  {
    id: 4,
    question: "对未来的规划",
    videoKeyword: "future_plan",
    nodeType: "heart",
    color: "#a18cd1",
    duration: 200,
    speaker: "Him",
    slices: []
  },
  {
    id: 5,
    question: "想对对方说的话",
    videoKeyword: "secret_message",
    nodeType: "star", // 特殊节点
    color: "#fad0c4", // 混合色
    duration: 300,
    speaker: "Both",
    slices: []
  }
];

// 100道情侣采访问题库 - 三周年特别版
// 分类：Deep (深情/回忆), Fun (趣味/默契), Future (未来/规划)
export const QUESTION_LIBRARY = [
  // --- Deep: 回忆与情感 (35题) ---
  { id: 1001, question: "第一次见面的印象？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1002, question: "什么时候确定的关系？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1003, question: "最感动的一件事", category: "Deep", defaultSpeaker: "Both" },
  { id: 1004, question: "如果我们吵架了，希望怎么和好？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1005, question: "对方最让你有安全感的瞬间", category: "Deep", defaultSpeaker: "Both" },
  { id: 1006, question: "这三年里变化最大的是什么？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1007, question: "有没有哪个瞬间让你觉得'就是这个人了'？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1008, question: "最喜欢对方身体的哪个部位？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1009, question: "如果我们必须异地，你会怎么办？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1010, question: "你觉得爱是什么？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1011, question: "对方做的哪道菜最好吃？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1012, question: "第一次牵手时的心理活动", category: "Deep", defaultSpeaker: "Both" },
  { id: 1013, question: "第一次接吻的感觉", category: "Deep", defaultSpeaker: "Both" },
  { id: 1014, question: "如果你能拥有一种超能力来帮助我们的关系，会是什么？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1015, question: "最想感谢对方的一件事", category: "Deep", defaultSpeaker: "Both" },
  { id: 1016, question: "有没有什么事情是你一直想问但没敢问的？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1017, question: "这三年里最遗憾的一件事", category: "Deep", defaultSpeaker: "Both" },
  { id: 1018, question: "你觉得我们最合拍的地方是哪里？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1019, question: "你觉得我们需要改进的地方是哪里？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1020, question: "如果时间倒流，你还会选择我吗？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1021, question: "最喜欢和我一起做什么事？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1022, question: "有没有哪个瞬间觉得我很可爱？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1023, question: "生病时对方做过最暖心的事", category: "Deep", defaultSpeaker: "Both" },
  { id: 1024, question: "我们之间最独特的暗号是什么？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1025, question: "描述一下你眼中的我", category: "Deep", defaultSpeaker: "Both" },
  { id: 1026, question: "这三年里最开心的一次旅行", category: "Deep", defaultSpeaker: "Both" },
  { id: 1027, question: "如果可以，想回到过去的哪个时刻？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1028, question: "对方的哪个缺点是你觉得可爱的？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1029, question: "最害怕失去我的什么？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1030, question: "如果有下辈子，还愿意遇见我吗？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1031, question: "最近一次心动是什么时候？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1032, question: "觉得我穿什么衣服最好看？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1033, question: "最想听我唱哪首歌？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1034, question: "这三年里，我让你骄傲过吗？", category: "Deep", defaultSpeaker: "Both" },
  { id: 1035, question: "用三个词形容我们的关系", category: "Deep", defaultSpeaker: "Both" },

  // --- Fun: 趣味与脑洞 (35题) ---
  { id: 2001, question: "如果我是动物，我会是什么？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2002, question: "如果中了一千万，第一件事做什么？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2003, question: "谁的睡姿更奇葩？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2004, question: "如果我们可以互换身体一天，你想做什么？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2005, question: "对方最搞笑的口头禅", category: "Fun", defaultSpeaker: "Both" },
  { id: 2006, question: "谁更爱吃醋？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2007, question: "谁的异性缘更好？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2008, question: "如果家里着火了（人没事），你先救什么？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2009, question: "谁更懒？举例说明", category: "Fun", defaultSpeaker: "Both" },
  { id: 2010, question: "对方做过最蠢萌的事", category: "Fun", defaultSpeaker: "Both" },
  { id: 2011, question: "如果我们要一起去荒岛，只能带三样东西", category: "Fun", defaultSpeaker: "Both" },
  { id: 2012, question: "谁更会撒娇？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2013, question: "谁唱歌更好听（或更难听）？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2014, question: "如果可以穿越到电影里，你想去哪部？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2015, question: "谁的酒量更好？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2016, question: "如果我们要养一只奇怪的宠物，会是什么？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2017, question: "对方最不能忍受的食物", category: "Fun", defaultSpeaker: "Both" },
  { id: 2018, question: "谁玩游戏更菜？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2019, question: "如果我变成了僵尸，你会怎么办？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2020, question: "谁更喜欢买买买？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2021, question: "如果我们可以隐形一天，你想做什么？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2022, question: "对方最像哪个卡通人物？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2023, question: "谁更路痴？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2024, question: "如果我们要组个乐队，谁主唱谁伴舞？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2025, question: "最想吐槽对方的一个习惯", category: "Fun", defaultSpeaker: "Both" },
  { id: 2026, question: "谁的笑点更低？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2027, question: "如果我们可以瞬间移动，现在想去哪？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2028, question: "谁更会做饭（或者是炸厨房）？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2029, question: "对方最尴尬的时刻", category: "Fun", defaultSpeaker: "Both" },
  { id: 2030, question: "如果世界末日来了，最后一餐吃什么？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2031, question: "谁更爱哭？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2032, question: "如果我们要拍一部电影，谁是主角？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2033, question: "谁更擅长讲冷笑话？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2034, question: "如果我突然变老了50岁，你第一反应是什么？", category: "Fun", defaultSpeaker: "Both" },
  { id: 2035, question: "谁是家里的'老大'？", category: "Fun", defaultSpeaker: "Both" },

  // --- Future: 未来与规划 (30题) ---
  { id: 3001, question: "对未来的规划", category: "Future", defaultSpeaker: "Both" },
  { id: 3002, question: "想对对方说的话", category: "Future", defaultSpeaker: "Both" },
  { id: 3003, question: "理想中的婚礼是什么样的？", category: "Future", defaultSpeaker: "Both" },
  { id: 3004, question: "想要几个孩子（或者宠物）？", category: "Future", defaultSpeaker: "Both" },
  { id: 3005, question: "退休后想去哪里生活？", category: "Future", defaultSpeaker: "Both" },
  { id: 3006, question: "未来三年最大的目标是什么？", category: "Future", defaultSpeaker: "Both" },
  { id: 3007, question: "希望我们50岁时是什么样子？", category: "Future", defaultSpeaker: "Both" },
  { id: 3008, question: "如果有一天我们都老得走不动了，会做什么？", category: "Future", defaultSpeaker: "Both" },
  { id: 3009, question: "最想和对方一起去的一个国家", category: "Future", defaultSpeaker: "Both" },
  { id: 3010, question: "希望我们未来的家是什么风格？", category: "Future", defaultSpeaker: "Both" },
  { id: 3011, question: "如果有了孩子，谁唱红脸谁唱白脸？", category: "Future", defaultSpeaker: "Both" },
  { id: 3012, question: "未来想一起学习什么新技能？", category: "Future", defaultSpeaker: "Both" },
  { id: 3013, question: "希望对方在未来改掉的一个小毛病", category: "Future", defaultSpeaker: "Both" },
  { id: 3014, question: "如果我们要创业，会做什么？", category: "Future", defaultSpeaker: "Both" },
  { id: 3015, question: "明年纪念日想怎么过？", category: "Future", defaultSpeaker: "Both" },
  { id: 3016, question: "希望我们老了以后谁先走？", category: "Future", defaultSpeaker: "Both" },
  { id: 3017, question: "未来家里谁管钱？", category: "Future", defaultSpeaker: "Both" },
  { id: 3018, question: "有没有什么梦想是希望对方支持的？", category: "Future", defaultSpeaker: "Both" },
  { id: 3019, question: "如果有一天我们不得不分开一段时间，会怎么维持感情？", category: "Future", defaultSpeaker: "Both" },
  { id: 3020, question: "希望给未来的孩子取什么小名？", category: "Future", defaultSpeaker: "Both" },
  { id: 3021, question: "未来想养什么宠物？", category: "Future", defaultSpeaker: "Both" },
  { id: 3022, question: "如果中了彩票，会先买什么？", category: "Future", defaultSpeaker: "Both" },
  { id: 3023, question: "希望我们每年的哪一天必须在一起？", category: "Future", defaultSpeaker: "Both" },
  { id: 3024, question: "未来想尝试的极限运动", category: "Future", defaultSpeaker: "Both" },
  { id: 3025, question: "希望对方永远保持的一点", category: "Future", defaultSpeaker: "Both" },
  { id: 3026, question: "如果以后我们吵架了，谁先低头？", category: "Future", defaultSpeaker: "Both" },
  { id: 3027, question: "未来最期待的一个瞬间", category: "Future", defaultSpeaker: "Both" },
  { id: 3028, question: "想对十年后的我们说什么？", category: "Future", defaultSpeaker: "Both" },
  { id: 3029, question: "觉得我们能一起走到最后吗？", category: "Future", defaultSpeaker: "Both" },
  { id: 3030, question: "最后，现在的你幸福吗？", category: "Future", defaultSpeaker: "Both" }
];

export const THEME_CONFIG = {
  light: {
    colors: {
      primary: "#ff9a9e",
      primaryHover: "#ff8a8e",
      secondary: "#a18cd1",
      bg: "#FFF9F5",
      surface: "#ffffff",
      surfaceHover: "#fff0f2",
      text: "#333333",
      textMuted: "#666666",
      textHint: "#999999",
      border: "#e5e7eb",
      success: "#34d399",
      warning: "#fbbf24",
      danger: "#ef4444",
      dangerBg: "#fee2e2",
      toolbarBg: "#f3f4f6",
      toolbarBgHover: "#e5e7eb"
    }
  },
  dark: {
    colors: {
      primary: "#ff8a8e", // Slightly more contrast for dark mode
      primaryHover: "#ff9a9e",
      secondary: "#b19cd9",
      bg: "#121212",
      surface: "#1e1e1e",
      surfaceHover: "#2c1c1f", // dark reddish
      text: "#f3f4f6", // WCAG >= 4.5:1 against #121212
      textMuted: "#9ca3af",
      textHint: "#6b7280",
      border: "#374151",
      success: "#10b981",
      warning: "#f59e0b",
      danger: "#f87171",
      dangerBg: "#451a1a",
      toolbarBg: "#374151",
      toolbarBgHover: "#4b5563"
    }
  },
  metrics: {
    radius: {
      sm: "6px",
      md: "8px",
      lg: "12px",
      xl: "20px",
      xxl: "24px",
      full: "9999px"
    },
    shadows: {
      sm: "0 1px 2px rgba(0,0,0,0.05)",
      md: "0 2px 4px rgba(0,0,0,0.08)",
      lg: "0 4px 8px rgba(0,0,0,0.1)",
      xl: "0 8px 24px rgba(0,0,0,0.12)",
      glow: "0 2px 10px rgba(255,154,158,0.3)"
    },
    spacing: {
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "24px",
      xxl: "32px"
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700
    }
  },
  fonts: {
    title: "'Noto Serif SC', serif",
    body: "'Noto Sans SC', sans-serif"
  }
};
