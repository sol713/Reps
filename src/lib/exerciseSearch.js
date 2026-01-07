export const EXERCISE_ALIASES = {
  "卧推": ["平板杠铃卧推", "上斜杠铃卧推", "下斜杠铃卧推", "哑铃卧推"],
  "推胸": ["平板杠铃卧推", "哑铃卧推", "器械推胸"],
  "深蹲": ["杠铃深蹲", "颈前深蹲", "高脚杯深蹲", "史密斯深蹲"],
  "硬拉": ["传统硬拉", "罗马尼亚硬拉", "相扑硬拉", "六角杠硬拉"],
  "划船": ["杠铃划船", "哑铃划船", "坐姿划船", "T杠划船"],
  "引体": ["引体向上", "宽握引体", "窄握引体", "对握引体"],
  "弯举": ["杠铃弯举", "哑铃弯举", "锤式弯举", "牧师凳弯举"],
  "肩推": ["哑铃肩推", "杠铃推举", "阿诺德推举", "器械肩推"],
  "飞鸟": ["哑铃飞鸟", "龙门架飞鸟", "器械飞鸟"],
  "下拉": ["高位下拉", "宽握下拉", "窄握下拉", "直臂下拉"],
  "三头": ["三头下压", "过头臂屈伸", "仰卧臂屈伸", "窄握卧推"],
  "腿举": ["倒蹬", "45度腿举", "水平腿举"],
  "夹胸": ["龙门架夹胸", "蝴蝶机夹胸"]
};

export function searchExercises(query, exercises) {
  const keyword = query.trim().toLowerCase();
  if (!keyword) {
    return exercises;
  }

  const directMatches = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(keyword)
  );

  const aliasMatches = [];
  Object.entries(EXERCISE_ALIASES).forEach(([alias, names]) => {
    if (!alias.includes(keyword)) {
      return;
    }

    names.forEach((name) => {
      const exercise = exercises.find((item) => item.name === name);
      if (exercise && !directMatches.includes(exercise)) {
        aliasMatches.push(exercise);
      }
    });
  });

  const results = [...directMatches, ...aliasMatches];
  return Array.from(new Set(results));
}
