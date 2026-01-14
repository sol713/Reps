export const presetTemplates = [
  {
    name: "胸日训练",
    description: "针对胸部的经典训练计划",
    color: "#FF453A",
    exercises: [
      { name: "杠铃卧推", bodyPart: "chest", targetSets: 4, targetRepsMin: 8, targetRepsMax: 12 },
      { name: "哑铃上斜卧推", bodyPart: "chest", targetSets: 3, targetRepsMin: 10, targetRepsMax: 12 },
      { name: "蝴蝶机夹胸", bodyPart: "chest", targetSets: 3, targetRepsMin: 12, targetRepsMax: 15 },
      { name: "绳索夹胸", bodyPart: "chest", targetSets: 3, targetRepsMin: 12, targetRepsMax: 15 }
    ]
  },
  {
    name: "背日训练",
    description: "打造厚实背部的训练计划",
    color: "#30D158",
    exercises: [
      { name: "引体向上", bodyPart: "back", targetSets: 4, targetRepsMin: 6, targetRepsMax: 10 },
      { name: "杠铃划船", bodyPart: "back", targetSets: 4, targetRepsMin: 8, targetRepsMax: 12 },
      { name: "高位下拉", bodyPart: "back", targetSets: 3, targetRepsMin: 10, targetRepsMax: 12 },
      { name: "坐姿划船", bodyPart: "back", targetSets: 3, targetRepsMin: 10, targetRepsMax: 12 }
    ]
  },
  {
    name: "肩日训练",
    description: "全方位肩部训练计划",
    color: "#0A84FF",
    exercises: [
      { name: "哑铃推举", bodyPart: "shoulder", targetSets: 4, targetRepsMin: 8, targetRepsMax: 12 },
      { name: "侧平举", bodyPart: "shoulder", targetSets: 4, targetRepsMin: 12, targetRepsMax: 15 },
      { name: "俯身飞鸟", bodyPart: "shoulder", targetSets: 3, targetRepsMin: 12, targetRepsMax: 15 },
      { name: "面拉", bodyPart: "shoulder", targetSets: 3, targetRepsMin: 15, targetRepsMax: 20 }
    ]
  },
  {
    name: "腿日训练",
    description: "腿部力量与肌肉的训练计划",
    color: "#BF5AF2",
    exercises: [
      { name: "杠铃深蹲", bodyPart: "leg", targetSets: 4, targetRepsMin: 6, targetRepsMax: 10 },
      { name: "腿举", bodyPart: "leg", targetSets: 4, targetRepsMin: 10, targetRepsMax: 12 },
      { name: "腿弯举", bodyPart: "leg", targetSets: 3, targetRepsMin: 10, targetRepsMax: 12 },
      { name: "腿屈伸", bodyPart: "leg", targetSets: 3, targetRepsMin: 12, targetRepsMax: 15 }
    ]
  }
];
