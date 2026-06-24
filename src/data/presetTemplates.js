export const presetTemplates = [
  {
    name: "推日 (Push)",
    description: "胸+肩前束+三头，经典PPL推日训练",
    color: "#FF453A",
    exercises: [
      { name: "杠铃平板卧推", bodyPart: "chest", targetSets: 4, targetRepsMin: 6, targetRepsMax: 10 },
      { name: "哑铃上斜卧推", bodyPart: "chest", targetSets: 3, targetRepsMin: 8, targetRepsMax: 12 },
      { name: "蝴蝶机夹胸", bodyPart: "chest", targetSets: 3, targetRepsMin: 12, targetRepsMax: 15 },
      { name: "哑铃坐姿推举", bodyPart: "shoulder", targetSets: 3, targetRepsMin: 8, targetRepsMax: 12 },
      { name: "哑铃侧平举", bodyPart: "shoulder", targetSets: 4, targetRepsMin: 12, targetRepsMax: 15 },
      { name: "绳索三头下压", bodyPart: "arm", targetSets: 3, targetRepsMin: 10, targetRepsMax: 15 }
    ]
  },
  {
    name: "拉日 (Pull)",
    description: "背+肩后束+二头，经典PPL拉日训练",
    color: "#30D158",
    exercises: [
      { name: "引体向上", bodyPart: "back", targetSets: 4, targetRepsMin: 5, targetRepsMax: 10 },
      { name: "杠铃俯身划船", bodyPart: "back", targetSets: 4, targetRepsMin: 8, targetRepsMax: 12 },
      { name: "坐姿绳索划船", bodyPart: "back", targetSets: 3, targetRepsMin: 10, targetRepsMax: 12 },
      { name: "绳索面拉", bodyPart: "shoulder", targetSets: 3, targetRepsMin: 15, targetRepsMax: 20 },
      { name: "杠铃弯举", bodyPart: "arm", targetSets: 3, targetRepsMin: 8, targetRepsMax: 12 },
      { name: "锤式弯举", bodyPart: "arm", targetSets: 3, targetRepsMin: 10, targetRepsMax: 12 }
    ]
  },
  {
    name: "腿日 (Leg)",
    description: "股四+股二+臀部+小腿全面覆盖",
    color: "#BF5AF2",
    exercises: [
      { name: "杠铃深蹲", bodyPart: "leg", targetSets: 4, targetRepsMin: 5, targetRepsMax: 8 },
      { name: "罗马尼亚硬拉", bodyPart: "leg", targetSets: 4, targetRepsMin: 8, targetRepsMax: 12 },
      { name: "腿举", bodyPart: "leg", targetSets: 3, targetRepsMin: 10, targetRepsMax: 15 },
      { name: "俯卧腿弯举", bodyPart: "leg", targetSets: 3, targetRepsMin: 10, targetRepsMax: 12 },
      { name: "保加利亚分腿蹲", bodyPart: "leg", targetSets: 3, targetRepsMin: 8, targetRepsMax: 12 },
      { name: "站姿提踵", bodyPart: "leg", targetSets: 4, targetRepsMin: 12, targetRepsMax: 20 }
    ]
  },
  {
    name: "上肢力量日",
    description: "复合动作为主的上肢力量训练",
    color: "#FF9500",
    exercises: [
      { name: "杠铃平板卧推", bodyPart: "chest", targetSets: 5, targetRepsMin: 3, targetRepsMax: 5 },
      { name: "杠铃俯身划船", bodyPart: "back", targetSets: 5, targetRepsMin: 3, targetRepsMax: 5 },
      { name: "杠铃站姿推举", bodyPart: "shoulder", targetSets: 4, targetRepsMin: 5, targetRepsMax: 8 },
      { name: "引体向上", bodyPart: "back", targetSets: 3, targetRepsMin: 5, targetRepsMax: 8 },
      { name: "双杠臂屈伸", bodyPart: "chest", targetSets: 3, targetRepsMin: 8, targetRepsMax: 12 }
    ]
  },
  {
    name: "手臂专项日",
    description: "二头+三头超级组训练",
    color: "#0A84FF",
    exercises: [
      { name: "杠铃弯举", bodyPart: "arm", targetSets: 4, targetRepsMin: 8, targetRepsMax: 12 },
      { name: "绳索三头下压", bodyPart: "arm", targetSets: 4, targetRepsMin: 10, targetRepsMax: 15 },
      { name: "哑铃交替弯举", bodyPart: "arm", targetSets: 3, targetRepsMin: 10, targetRepsMax: 12 },
      { name: "绳索过头臂屈伸", bodyPart: "arm", targetSets: 3, targetRepsMin: 10, targetRepsMax: 15 },
      { name: "牧师凳弯举", bodyPart: "arm", targetSets: 3, targetRepsMin: 10, targetRepsMax: 12 },
      { name: "窄距卧推", bodyPart: "arm", targetSets: 3, targetRepsMin: 8, targetRepsMax: 12 }
    ]
  },
  {
    name: "核心强化",
    description: "全方位核心训练，提升稳定性",
    color: "#64D2FF",
    exercises: [
      { name: "悬垂举腿", bodyPart: "core", targetSets: 4, targetRepsMin: 10, targetRepsMax: 15 },
      { name: "绳索卷腹", bodyPart: "core", targetSets: 3, targetRepsMin: 12, targetRepsMax: 15 },
      { name: "俄罗斯转体", bodyPart: "core", targetSets: 3, targetRepsMin: 15, targetRepsMax: 20 },
      { name: "死虫式", bodyPart: "core", targetSets: 3, targetRepsMin: 10, targetRepsMax: 12 },
      { name: "平板支撑", bodyPart: "core", targetSets: 3, targetRepsMin: 30, targetRepsMax: 60 }
    ]
  }
];
