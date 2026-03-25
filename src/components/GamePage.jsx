import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Construction, Heart, User, Trophy, Grid3X3, Puzzle, Dice5, Swords, TrendingUp, Activity, BarChart3, Medal, Star, Play, RotateCcw, LogOut, RefreshCw, XCircle, Lock, Unlock, Flag, Bomb, AlertTriangle, Zap, Hexagon, Diamond, Circle, Square, Triangle, Plane, ArrowUp, ArrowDown, Move, ArrowLeft, MessageCircle, Pointer, Plus, X, Ghost } from 'lucide-react';

// Truth or Dare Data
const GENTLE_TRUTHS = [
  "第一次见到对方是什么印象？",
  "最喜欢对方身体的哪个部位？",
  "对方做过最让你感动的一件事是什么？",
  "如果可以和对方互换身体一天，你最想做什么？",
  "觉得对方像哪种小动物？",
  "最近一次梦到对方是什么时候？",
  "对方穿什么颜色的衣服最好看？",
  "最想和对方去哪里旅游？",
  "觉得两人在一起后自己最大的变化是什么？",
  "此时此刻最想对对方说的一句话是什么？",
  "你最喜欢的一道菜是什么？",
  "你小时候的梦想是什么？",
  "如果你中了大奖，第一件事会做什么？",
  "你最害怕的动物是什么？",
  "你最喜欢的一部电影是什么？",
  "你觉得自己最大的优点是什么？",
  "你最想去的一个国家是哪里？",
  "你最喜欢的季节是哪个？",
  "你相信世界上有外星人吗？",
  "你最讨厌的一种食物是什么？",
  "你上一次哭是因为什么？",
  "你最喜欢的一首歌是什么？",
  "如果可以拥有一种超能力，你想要什么？",
  "你最喜欢的颜色是什么？",
  "你觉得完美的周末应该怎么过？",
  "你最喜欢的一本书是什么？",
  "你觉得自己是个乐观的人还是悲观的人？",
  "你最喜欢的一句名言是什么？",
  "你最想学会的一项技能是什么？",
  "你最难忘的一次旅行是去哪里？",
  "你觉得自己更像爸爸还是更像妈妈？",
  "你最喜欢的一种冰淇淋口味是什么？",
  "你相信一见钟情吗？",
  "你觉得男女之间有纯友谊吗？",
  "你最喜欢的一个节日是什么？",
  "你小时候最喜欢的玩具是什么？",
  "你觉得自己最大的缺点是什么？",
  "你最喜欢的一种运动是什么？",
  "你更喜欢猫还是狗？",
  "你最喜欢的一个卡通人物是谁？",
  "你觉得自己是个浪漫的人吗？",
  "你最喜欢的一家餐厅是哪家？",
  "你最想见到的一位名人是谁？",
  "你觉得自己是个早起鸟还是夜猫子？",
  "你最喜欢的一种水果是什么？",
  "你觉得自己最擅长做的一件事是什么？",
  "你最喜欢的一款游戏是什么？",
  "你觉得自己是个外向的人还是内向的人？",
  "你最喜欢的一种花是什么？",
  "你最想尝试的一种极限运动是什么？",
  "你觉得钱重要还是爱情重要？",
  "你最喜欢的一个历史人物是谁？",
  "你觉得自己是个有耐心的人吗？",
  "你最喜欢的一种饮料是什么？",
  "你最想改变自己的一点是什么？",
  "你觉得自己是个幽默的人吗？",
  "你最喜欢的一种天气是什么？",
  "你最想对十年前的自己说什么？",
  "你觉得自己是个感性的人还是理性的人？",
  "你最喜欢的一件衣服是什么样子的？"
];

const GENTLE_DARES = [
  "深情对视10秒钟，不许笑。",
  "模仿对方生气的样子。",
  "给对方按摩肩膀3分钟。",
  "夸赞对方的三个优点。",
  "公主抱/背对方做3个深蹲（量力而行）。",
  "唱一首对方喜欢的情歌（片段也可以）。",
  "用方言说一句“我爱你”。",
  "让对方在你的脸上画一个小乌龟（用可清洗的笔）。",
  "喂对方吃一口东西。",
  "和对方拍一张搞怪合照。",
  "做一个鬼脸并拍照。",
  "模仿一种动物的叫声。",
  "唱一首儿歌。",
  "背诵一首古诗。",
  "做一个深蹲。",
  "原地转圈5圈。",
  "用左手写下自己的名字。",
  "给对方讲一个冷笑话。",
  "模仿对方的一个习惯动作。",
  "做10个开合跳。",
  "保持一个姿势1分钟不动。",
  "用一种奇怪的口音说话1分钟。",
  "模仿新闻联播主持人的语气播报一段新闻。",
  "做一个很丑的表情保持10秒。",
  "模仿一种乐器的声音。",
  "模仿机器人走路。",
  "用屁股写字（写“我爱你”）。",
  "模仿一位明星的经典动作。",
  "唱一首你最讨厌的歌。",
  "模仿婴儿哭声。",
  "模仿老人走路。",
  "做一个瑜伽动作。",
  "模仿僵尸走路。",
  "模仿大猩猩拍胸脯。",
  "模仿鸭子走路绕桌子一圈。",
  "用嘴咬住一支笔说话。",
  "模仿奥特曼发射光线。",
  "模仿孙悟空挠痒痒。",
  "模仿猪八戒背媳妇。",
  "模仿林黛玉葬花（夸张版）。",
  "模仿迈克尔杰克逊的太空步。",
  "模仿猫走猫步。",
  "模仿狗撒尿的动作（假装）。",
  "模仿公鸡打鸣。",
  "模仿母鸡下蛋。",
  "模仿青蛙跳。",
  "模仿企鹅走路。",
  "模仿袋鼠跳。",
  "模仿蛇爬行（手部动作）。",
  "模仿蚊子飞的声音。",
  "模仿苍蝇搓手。",
  "模仿大象甩鼻子。",
  "模仿长颈鹿吃树叶。",
  "模仿树懒动作慢吞吞。",
  "模仿鱼游泳（嘴巴动作）。",
  "模仿螃蟹横着走。",
  "模仿乌龟爬。",
  "模仿兔子吃胡萝卜。",
  "模仿老鼠偷吃东西。",
  "模仿恐龙吼叫。"
];

const HOT_TRUTHS = [
  "你觉得我们之间最浪漫的一刻是？",
  "第一次想亲我是什么时候？",
  "最喜欢我穿哪件衣服？",
  "如果可以，你想在哪里和我亲热？",
  "我做的哪件事让你觉得最心动？",
  "你觉得我们的第一次约会怎么样？",
  "有没有做过关于我的春梦？",
  "最想和我一起尝试什么新鲜事？",
  "你觉得我哪个动作最性感？",
  "如果不考虑现实，你想和我私奔去哪里？",
  "你觉得初吻的感觉怎么样？",
  "你最喜欢接吻的时候手放在哪里？",
  "你觉得异地恋能长久吗？",
  "你最喜欢对方穿什么颜色的内衣（如果见过）/衣服？",
  "你觉得恋爱中最重要的三个特质是什么？",
  "你最喜欢对方身上的哪个味道？",
  "你觉得什么时候的对方最迷人？",
  "你有没有在梦里梦见过对方？做了什么？",
  "你最想和对方一起完成的一个愿望是什么？",
  "你觉得对方最性感的一个眼神是什么样的？",
  "你有没有想过和对方结婚？",
  "你最喜欢对方亲吻你的哪个部位？",
  "你觉得两个人在一起最舒服的状态是什么？",
  "你有没有对对方撒过谎？为什么？",
  "你最嫉妒对方和谁在一起？",
  "你觉得对方最让你心动的一句情话是什么？",
  "你有没有偷看过对方的手机？",
  "你觉得对方最可爱的一个瞬间是什么？",
  "你最想听到对方对你说什么？",
  "你觉得两个人在一起最重要的是性还是爱？",
  "你有没有幻想过和对方未来的生活？",
  "你最喜欢对方怎么称呼你？",
  "你觉得对方最吸引你的是外表还是内在？",
  "你有没有因为对方而改变过自己？",
  "你最想和对方一起去哪里度蜜月？",
  "你觉得对方最让你感动的一瞬间是什么？",
  "你有没有想过给对方一个惊喜？是什么？",
  "你最喜欢对方的哪个身体部位？",
  "你觉得对方最让你受不了的一个缺点是什么？",
  "你有没有想过和对方生孩子？",
  "你最喜欢和对方在什么时候亲热？",
  "你觉得对方最性感的一件衣服是什么？",
  "你有没有在心里默默给对方加分？",
  "你觉得对方最让你有安全感的一个举动是什么？",
  "你最想和对方一起尝试的一件事是什么？",
  "你觉得对方最让你骄傲的一点是什么？",
  "你有没有想过和对方一起变老？",
  "你最喜欢对方怎么哄你？",
  "你觉得对方最让你着迷的一个特质是什么？",
  "你有没有想过和对方私奔？",
  "你最喜欢对方亲你的额头还是嘴唇？",
  "你觉得对方最让你心疼的一个瞬间是什么？",
  "你有没有在心里偷偷许愿和对方永远在一起？",
  "你最喜欢和对方怎么牵手？",
  "你觉得对方最让你感到幸福的一件事是什么？",
  "你有没有想过把对方的名字纹在身上？",
  "你最喜欢对方怎么抱你？",
  "你觉得对方最让你感到温暖的一句话是什么？",
  "你有没有想过和对方一起养一只宠物？",
  "你最喜欢和对方一起看什么类型的电影？"
];

const HOT_DARES = [
  "深吻对方10秒。",
  "在对方耳边轻轻吹气。",
  "公主抱对方深蹲3个。",
  "用嘴喂对方吃一样东西。",
  "隔着纸巾亲吻对方嘴唇。",
  "摸对方的腹肌/腰（如果愿意）。",
  "用一种诱惑的语气说“我要吃了你”。",
  "给对方按腿3分钟。",
  "壁咚对方并对视10秒。",
  "让对方坐在你腿上1分钟。",
  "和对方深情对视1分钟。",
  "亲吻对方的额头。",
  "亲吻对方的手背。",
  "从背后拥抱对方1分钟。",
  "给对方一个公主抱（或被抱）。",
  "用嘴喂对方吃一颗糖。",
  "坐在对方的大腿上1分钟。",
  "给对方按摩肩膀5分钟。",
  "亲吻对方的脸颊。",
  "用鼻子蹭对方的鼻子。",
  "在对方耳边轻轻说“我爱你”。",
  "握着对方的手深情表白。",
  "摸对方的头（摸头杀）。",
  "刮对方的鼻子。",
  "亲吻对方的脖子（轻吻）。",
  "让对方躺在你的腿上。",
  "给对方唱一首情歌。",
  "和对方跳一支慢舞。",
  "用脸颊蹭对方的脸颊。",
  "咬一下对方的耳朵（轻轻的）。",
  "把手放在对方的心口感受心跳。",
  "亲吻对方的眼睛。",
  "帮对方整理头发。",
  "帮对方扣扣子/拉拉链。",
  "喂对方喝一口水。",
  "和对方十指紧扣1分钟。",
  "靠在对方肩膀上1分钟。",
  "摸摸对方的脸。",
  "亲吻对方的手心。",
  "在对方背上写字让对方猜。",
  "用一种宠溺的眼神看着对方。",
  "夸对方三个性感的部位。",
  "模仿对方撒娇的样子。",
  "和对方拍一张亲密的合照。",
  "抱着对方转一圈。",
  "亲吻对方的头发。",
  "帮对方涂唇膏（如果有）。",
  "帮对方按摩头部。",
  "轻轻咬一下对方的手指。",
  "用额头抵住对方的额头。",
  "托着对方的下巴深情对视。",
  "亲吻对方的锁骨（轻吻）。",
  "从后面环住对方的腰。",
  "把头埋在对方的颈窝里。",
  "闻一下对方身上的味道。",
  "摸摸对方的耳垂。",
  "亲吻对方的手腕。",
  "和对方比心。",
  "对对方做飞吻。",
  "在对方手心画一个爱心。"
];

const INTIMATE_TRUTHS = [
  "最喜欢我亲你哪里？",
  "对我的身体哪个部位最着迷？",
  "描述一个关于我的性幻想（可以含蓄一点）。",
  "你觉得我们的性生活和谐吗？（如适用）",
  "最想尝试的一个姿势是？",
  "你觉得前戏重要还是过程重要？",
  "喜欢开灯还是关灯？",
  "有没有特别想尝试的地点？",
  "如果让你给我打分（床上表现），你会打几分？",
  "最让你受不了的一点（好的方面）是？",
  "你最喜欢我穿哪种风格的内衣？",
  "有没有哪次亲热让你印象最深刻？为什么？",
  "你自慰的时候通常会想什么？",
  "如果我们要拍一部“电影”，你希望剧情是什么？",
  "你觉得我的吻技怎么样？",
  "你更喜欢上面还是下面？",
  "有没有想过尝试一些特殊的玩法（比如轻度调教）？",
  "你觉得我的叫声好听吗？",
  "如果我可以为你做任何事，你希望是什么？",
  "你有没有在公共场合对我产生过冲动？",
  "你觉得情趣玩具怎么样？想不想一起尝试？",
  "第一次看“动作片”是几岁？",
  "你最喜欢被摸哪里？",
  "如果我们要玩车震，你觉得在哪里比较刺激？",
  "你觉得高潮的感觉像什么？",
  "你有没有过假装高潮？",
  "你喜欢粗暴一点还是温柔一点？",
  "看着我的眼睛，说出你想对我做的一件坏事。",
  "你觉得我的屁股性感吗？",
  "你能不能接受在镜子面前做？",
  "你觉得自己在性方面最大的优点是什么？",
  "如果不考虑道德和法律，你最想尝试的一种禁忌玩法是什么？",
  "你有没有在心里偷偷拿我和你的前任比较过床上的表现？",
  "有没有哪个瞬间，你看着我的时候其实脑子里在想别人？",
  "你最喜欢我用嘴为你做的一件事是什么？",
  "如果在野外（比如树林或海滩）没人看到，你敢尝试吗？",
  "你有没有过被同性吸引的瞬间？",
  "描述一下你做过的最让你脸红的春梦。",
  "你觉得我们在床上最大的不和谐是什么（如果有的话）？",
  "如果可以给我的身体部位投保，你会选哪里？",
  "你有没有想过和我一起看成人电影并模仿里面的情节？",
  "你觉得口交和性交哪个更让你舒服？",
  "你有没有幻想过被强迫（Role Play）的情节？",
  "你最希望我穿什么角色的服装来诱惑你？",
  "如果我们可以互换性别做爱一次，你最想体验什么感觉？",
  "你有没有在和我亲热的时候假装高潮过？",
  "你觉得我们在车里做过最刺激的一次是哪次？",
  "你有没有想过尝试三人行（3P）？（仅幻想层面）",
  "你最喜欢我发出什么样的声音？",
  "如果我突然要在客厅里要你，你会拒绝还是配合？",
  "你觉得我们的前戏时间是太长了还是太短了？",
  "你有没有想过在公共交通工具上（如飞机卫生间）尝试？",
  "你觉得我的舌头灵活吗？",
  "你最喜欢我从后面抱你还是正面抱你？",
  "如果让你用一种食物来形容我的下面，你会选什么？",
  "你有没有想过把我绑起来？",
  "你觉得我们在床上最尴尬的一次经历是什么？",
  "你有没有试过在视频通话的时候自慰给我看？",
  "你觉得我的手技怎么样？",
  "你有没有想过尝试肛交（或者已经尝试过的感受）？",
  "你最喜欢我亲吻你身体的哪个敏感带？",
  "如果我们要拍摄属于我们的小视频，你会同意吗？",
  "你觉得我最性感的一件内衣是哪件？",
  "你有没有在工作/学习的时候突然因为想我而有了反应？",
  "你觉得我们在做爱时沟通够不够？",
  "你有没有想过尝试在厨房的流理台上做？",
  "你觉得我在床上是主导型还是顺从型？你喜欢吗？",
  "你有没有想过尝试用跳蛋或其他玩具？",
  "你觉得我们在哪里做的次数最多？",
  "你有没有想过在阳台上做（晚上）？",
  "你觉得我的体力怎么样？",
  "你最喜欢哪种体位（具体描述）？",
  "你有没有想过尝试BDSM（轻度）？",
  "你觉得我的味道闻起来像什么？",
  "你有没有试过在水里（浴缸或泳池）做？感觉如何？",
  "你觉得我们在早上做还是晚上做更有感觉？",
  "你有没有想过尝试蒙眼Play？",
  "你觉得我的呻吟声是大还是小？",
  "你有没有想过让我穿上你的衬衫（并不穿内衣）？",
  "如果今晚你可以对我做任何事，你想做什么？",
  "你觉得我们的性生活频率是刚好、太频繁还是太少？",
  "你有没有想过在做爱的时候使用润滑油？",
  "你觉得我身体最敏感的地方是哪里？",
  "如果不考虑清洁问题，你最想在哪里尝试颜射？",
  "你有没有幻想过被我捆绑或者轻微施虐？",
  "你觉得我的叫床声是太大、太小还是刚刚好？",
  "有没有哪个瞬间，你仅仅看着我就湿了/硬了？",
  "你最希望我穿什么类型的衣服（或者不穿）来诱惑你？",
  "你有没有在看片的时候把自己代入成主角，把对方代入成我？",
  "你觉得口交的时候，深喉会让这更有感觉吗？",
  "你有没有想过在做爱的时候使用拍摄设备记录下来？",
  "你最喜欢我用哪种速度？快节奏冲刺还是慢节奏研磨？",
  "如果我们玩角色扮演，你最想让我扮演什么身份（比如护士、老师、老板）？",
  "你有没有想过在公共场合（比如电影院角落、公园长椅）偷偷做？",
  "你觉得我的下面味道怎么样？",
  "你有没有幻想过三人行（3P），如果是，是两男一女还是两女一男？",
  "你最喜欢后入式是因为视觉刺激还是身体感觉？",
  "你有没有想过尝试肛交（或者再次尝试）？",
  "你觉得我们在床上最默契的一个瞬间是什么？",
  "你有没有在和我打电话或者视频的时候偷偷自慰过？",
  "你最喜欢我亲吻你身体的哪个部位（除了私处）？",
  "你觉得我的性技巧在你的历任伴侣中能排第几？",
  "你有没有想过在镜子面前做爱，看着我们的身体交缠？",
  "你觉得高潮的时候，你脑子里在想什么？",
  "你有没有试过在水里（浴室、泳池、海里）做爱？感受如何？",
  "你最喜欢我在高潮时对你说的脏话是什么？",
  "你有没有想过尝试露出（比如在窗边做爱不拉窗帘）？",
  "你觉得我的胸部/腹肌手感如何？",
  "你有没有想过尝试轻度的窒息Play（掐脖子）？",
  "你最希望我用嘴为你服务多长时间？",
  "你有没有在梦里梦到过和我做一些羞羞的事情？",
  "你觉得我们在车震的时候，最刺激的是什么？",
  "你有没有想过尝试使用跳蛋或者其他情趣玩具助兴？",
  "你觉得我的舌头灵活吗？你最喜欢我怎么用它？",
  "你有没有想过让我穿上你的衬衫（下面真空）？",
  "你觉得我们在早上晨勃时做爱更有感觉，还是晚上更有感觉？",
  "你有没有想过尝试滴蜡？",
  "你觉得我的哪个表情最让你把持不住？",
  "你有没有想过在办公室或者教室这种严肃的场合做爱？",
  "你最喜欢我主动坐上来自己动，还是你主导？",
  "你有没有想过尝试足交？",
  "你觉得我的屁股性感吗？你喜欢打它吗？",
  "你有没有想过让我戴上项圈或者猫耳朵？",
  "你觉得我们在床上最尴尬的一次经历是什么？",
  "你有没有想过尝试野战（在野外无人的地方）？",
  "你最喜欢内射还是外射（如果安全措施允许）？",
  "你有没有想过让我用冰块或者热蜡刺激你的身体？",
  "你觉得我的呻吟声好听吗？会让你更兴奋吗？",
  "你有没有幻想过在被我惩罚（Spanking）时感到兴奋？",
  "你最喜欢我穿丁字裤、蕾丝内裤还是不穿？",
  "你有没有想过在做爱的时候互相喂食？",
  "你觉得我们的前戏通常足够吗？你希望增加什么环节？",
  "你觉得我们的第一次是完美的吗？如果不是，缺了什么？"
];

const INTIMATE_DARES = [
  "亲吻对方的脖子20秒。",
  "脱掉对方一件衣服（外套也算）。",
  "让对方在你的大腿上坐1分钟。",
  "蒙眼猜对方身体部位。",
  "发出一种诱惑的声音。",
  "用舌头写字在对方背上让对方猜。",
  "种一颗草莓（如果不介意）。",
  "互相喂食一种水果（比如葡萄）。",
  "模仿一种动物叫声来求爱。",
  "跳一段性感的舞蹈（30秒）。",
  "用嘴喂我喝水（或酒）。",
  "把手伸进我的衣服里停留30秒。",
  "用你的脸蹭我的胸口（隔着衣服）。",
  "跪在地上说“主人，请尽情吩咐我”。",
  "脱掉上衣（如果方便的话）。",
  "用舌头舔我的耳垂10秒。",
  "把冰块含在嘴里，然后亲吻我的脖子。",
  "让我用领带（或丝巾）绑住你的双手。",
  "在我的大腿内侧亲吻。",
  "模仿一种羞羞的体位动作做10次。",
  "让我检查你的内衣颜色。",
  "给我跳一段脱衣舞（只脱一件）。",
  "用你的身体蹭我的腿。",
  "趴在床上，让我打三下屁股。",
  "舔掉我手指上涂的奶油（或酸奶）。",
  "用嘴把我的袜子脱下来。",
  "让我闻一下你的脖子味道，并评价。",
  "发出不可描述的声音持续10秒。",
  "允许我随意摸你全身1分钟。",
  "跟我说一句极其下流的情话。",
  "用嘴解开对方的一颗扣子（或拉链）。",
  "在对方耳边发出三种不同的呻吟声。",
  "隔着裤子抚摸对方的敏感部位30秒。",
  "用舌头舔对方的锁骨一圈。",
  "让对方躺下，你在上面做俯卧撑，每次下去都要亲到对方。",
  "脱掉对方的袜子，并亲吻对方的脚背。",
  "把手伸进对方的衣服里，沿着脊椎骨慢慢摸下来。",
  "用冰块在对方的胸口画圈（如果没有冰块用湿手指）。",
  "含住对方的手指，并用舌头挑逗10秒。",
  "让对方坐在椅子上，你跪在中间帮对方解开皮带（或扣子）。",
  "互相脱掉对方的一件衣服（内衣除外）。",
  "用一种极其挑逗的姿势吃一根香蕉（或黄瓜/香肠）。",
  "在对方的脖子上留下一个吻痕（如果对方同意）。",
  "用嘴喂对方喝一口水，不许漏出来。",
  "趴在对方身上，用你的胸部磨蹭对方的胸部（隔着衣服）。",
  "让对方蒙上眼睛，你用羽毛（或手指）轻轻划过对方的全身。",
  "用领带把对方的手绑在床头（或椅子后）。",
  "在对方的耳边说一句你现在最想做的脏话。",
  "亲吻对方的大腿内侧，并慢慢向上移动（点到为止）。",
  "让对方躺下，你骑在对方身上磨蹭30秒。",
  "用舌头舔对方的乳头（隔着衣服或不隔）。",
  "模仿一段A片里的经典台词或叫声。",
  "把手放在对方的私处（隔着内裤）停留1分钟。",
  "让对方检查你的内裤，并描述颜色和款式。",
  "互相按摩对方的臀部3分钟。",
  "用嘴叼住一张纸巾，传给对方（嘴对嘴）。",
  "两人一起看一段激情视频1分钟，不许有反应。",
  "用你的脸颊蹭对方的私处位置（隔着衣服）。",
  "让对方躺在床上，你用嘴去探索对方的身体（除私处外）。",
  "咬住对方的下嘴唇，轻轻拉扯。",
  "在对方的肚子上吹气，直到对方求饶。",
  "用一种性感的姿势脱掉自己的上衣。",
  "坐在对方的脸上（注意体重和安全，或者模拟动作）。",
  "用手帮对方解决一次（如果环境允许且双方愿意）。",
  "亲吻对方的臀部。",
  "让对方用脚在你的身上踩踏按摩。",
  "用舌头舔对方的耳廓。",
  "把头埋进对方的胸口深呼吸10秒。",
  "两人紧紧拥抱，感受彼此的心跳和体温，持续1分钟。",
  "互相亲吻对方的肚脐眼。",
  "用一种挑逗的眼神看着对方，并不准眨眼持续30秒。",
  "模仿对方高潮时的表情。",
  "用手指在对方的大腿上写字，让对方猜。",
  "让对方用嘴巴解开你的内衣扣子（如果穿着）。",
  "两人尝试69姿势（仅摆姿势，不实战）。",
  "亲吻对方的背部，从上到下。",
  "用你的膝盖顶住对方的私处，轻轻摩擦。",
  "两人互换上衣穿。",
  "趴在对方身上，说出三个你最想对对方做的动作。",
  "马上开始一次前戏（限时5分钟）。",
  "脱掉对方的内裤（如果穿着），并用嘴叼着扔到一边。",
  "用舌头从对方的脚踝一直舔到大腿根部。",
  "让对方躺下，骑在对方脸上摩擦30秒。",
  "用嘴解开对方的皮带。",
  "隔着内裤/内衣，用手爱抚对方的私处1分钟。",
  "含住对方的手指，模仿口交的动作吞吐10秒。",
  "让对方蒙上眼睛，你用冰块滑过对方的全身敏感带。",
  "用领带或丝巾把对方的手绑在床头。",
  "在对方耳边发出高潮时的呻吟声，持续10秒。",
  "用屁股蹭对方的下体（隔着衣服）。",
  "跪在对方面前，用一种崇拜的眼神看着对方，并叫一声“主人”。",
  "互相脱掉对方的一件衣服，直到只剩内衣。",
  "用嘴喂对方吃一颗糖（或冰块），在嘴里交换。",
  "趴在床上，让对方打你的屁股5下（力度自选）。",
  "用舌头画圈舔对方的乳头（隔着衣服或直接）。",
  "把手伸进对方的衣服里，直接触摸对方的胸部/腹肌。",
  "坐在对方的大腿上，用下体磨蹭对方的下体。",
  "用一种极其淫荡的语气读一段小黄文（或者自己编一句）。",
  "让对方检查你的内裤颜色，如果是蕾丝/丁字裤/性感款，加分。",
  "用嘴咬住对方的耳垂，轻轻拉扯。",
  "躺在床上，摆出一个诱惑的姿势，让对方拍照（阅后即焚）。",
  "用手指在对方的大腿内侧写字，写“我要你”。",
  "亲吻对方的脖子，尝试种一个草莓。",
  "让对方躺下，你在上面做深蹲，每次蹲下都要让私处尽可能靠近对方的脸。",
  "用舌头舔对方的锁骨凹陷处。",
  "把头埋进对方的裤裆里（隔着裤子）深呼吸10秒。",
  "用手帮对方解决（打手枪/指交）1分钟（点到为止或继续）。",
  "模仿一种动物发情的叫声。",
  "让对方用脚踩你的私处（轻轻的）。",
  "两人尝试一种高难度的性爱体位（仅模仿动作）。",
  "用嘴把对方衬衫的扣子一颗颗解开。",
  "在对方的背上用指甲轻轻划过，引起战栗。",
  "舔对方的脖子，直到对方求饶。",
  "用胸部夹住对方的手臂（如果可以）。",
  "坐在对方身上，扭动腰肢跳一段艳舞。",
  "让对方把手放在你的私处，你自己动。",
  "用一种渴望的眼神看着对方，说“操我”或者“我要你”。",
  "两人互换内裤穿（如果尺寸允许且愿意）。",
  "用嘴含住对方的耳垂，发出啧啧的水声。",
  "让对方用皮带轻轻抽打你的屁股。",
  "跪在地上，帮对方脱鞋脱袜，并亲吻脚背。",
  "用冰水含在嘴里，然后给对方口交（模拟动作或亲吻敏感部位）。",
  "两人紧紧拥抱，下体紧贴，感受彼此的硬度/湿润。",
  "让对方用手指检查你的下面湿了没/硬了没。",
  "在对方耳边吹气，并轻声说出你的性幻想。",
  "用大腿夹住对方的腰，让对方抱起你。",
  "趴在对方身上，用舌头舔对方的喉结。",
  "让对方蒙眼，你用身体的任意部位去触碰对方的嘴唇。",
  "两人一起看一部AV的开头5分钟，观察对方反应。",
  "马上去洗手间，回来后告诉对方你有没有穿内裤。"
];

// 2048 Game Component
const Game2048 = ({ onEndGame, onRequirePunishment }) => {
  const [board, setBoard] = useState(Array(16).fill(0));
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, won, lost

  const initGame = () => {
    const newBoard = Array(16).fill(0);
    addNewTile(newBoard);
    addNewTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameState('playing');
  };

  useEffect(() => {
    initGame();
  }, []);

  const addNewTile = (currentBoard) => {
    const emptyIndices = currentBoard.map((val, idx) => val === 0 ? idx : -1).filter(idx => idx !== -1);
    if (emptyIndices.length > 0) {
      const randomIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      currentBoard[randomIdx] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const getTileColor = (value) => {
    const colors = {
      0: '#cdc1b4',
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e'
    };
    return colors[value] || '#3c3a32';
  };

  const getTileTextColor = (value) => {
    return value <= 4 ? '#776e65' : '#f9f6f2';
  };

  const moveLeft = (currentBoard) => {
    let newBoard = [...currentBoard];
    let moved = false;
    let scoreToAdd = 0;

    for (let r = 0; r < 4; r++) {
      let row = newBoard.slice(r * 4, r * 4 + 4);
      let filteredRow = row.filter(val => val !== 0);
      
      // Merge
      for (let i = 0; i < filteredRow.length - 1; i++) {
        if (filteredRow[i] === filteredRow[i + 1]) {
          filteredRow[i] *= 2;
          scoreToAdd += filteredRow[i];
          filteredRow[i + 1] = 0;
        }
      }
      filteredRow = filteredRow.filter(val => val !== 0);
      
      // Pad with zeros
      while (filteredRow.length < 4) {
        filteredRow.push(0);
      }

      if (filteredRow.some((val, idx) => val !== row[idx])) {
        moved = true;
      }

      // Update board
      for (let c = 0; c < 4; c++) {
        newBoard[r * 4 + c] = filteredRow[c];
      }
    }

    return { moved, newBoard, scoreToAdd };
  };

  const rotateBoard = (currentBoard) => {
    const newBoard = Array(16).fill(0);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        newBoard[c * 4 + (3 - r)] = currentBoard[r * 4 + c];
      }
    }
    return newBoard;
  };

  const rotateBoardCounterClockwise = (currentBoard) => {
    const newBoard = Array(16).fill(0);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        newBoard[(3 - c) * 4 + r] = currentBoard[r * 4 + c];
      }
    }
    return newBoard;
  };

  const handleMove = (direction) => {
    if (gameState !== 'playing') return;

    let tempBoard = [...board];
    let rotations = 0;

    // Align to Left move logic
    if (direction === 'up') {
      tempBoard = rotateBoardCounterClockwise(tempBoard);
      rotations = 1;
    } else if (direction === 'right') {
      tempBoard = rotateBoard(rotateBoard(tempBoard));
      rotations = 2;
    } else if (direction === 'down') {
      tempBoard = rotateBoard(tempBoard);
      rotations = 3;
    }

    const { moved, newBoard: processedBoard, scoreToAdd } = moveLeft(tempBoard);

    if (moved) {
      let finalBoard = processedBoard;
      // Rotate back
      if (direction === 'up') {
        finalBoard = rotateBoard(finalBoard);
      } else if (direction === 'right') {
        finalBoard = rotateBoard(rotateBoard(finalBoard));
      } else if (direction === 'down') {
        finalBoard = rotateBoardCounterClockwise(finalBoard);
      }

      addNewTile(finalBoard);
      setBoard(finalBoard);
      setScore(prev => prev + scoreToAdd);

      // Check Win
      if (finalBoard.some(val => val === 2048)) {
        setGameState('won');
      } 
      // Check Loss
      else if (!canMove(finalBoard)) {
        setGameState('lost');
        // Trigger punishment for loss
        // Since it's single player usually, maybe no punishment or self-punishment?
        // User didn't specify 2048 punishment, but we can hook it up if we want consistency.
        // Let's just set state for now.
      }
    }
  };

  const canMove = (currentBoard) => {
    if (currentBoard.includes(0)) return true;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = currentBoard[r * 4 + c];
        // Check right
        if (c < 3 && val === currentBoard[r * 4 + c + 1]) return true;
        // Check down
        if (r < 3 && val === currentBoard[(r + 1) * 4 + c]) return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        handleMove(e.key.replace('Arrow', '').toLowerCase());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, gameState]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: 'min(500px, 90vw)',
        alignItems: 'center'
      }}>
        <div style={{
          background: '#bbada0',
          padding: '10px 20px',
          borderRadius: '6px',
          color: '#eee4da',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>SCORE</div>
          <div style={{ fontSize: '1.5rem', color: '#fff' }}>{score}</div>
        </div>
        <button onClick={initGame} style={{
          padding: '10px 20px',
          background: '#8f7a66',
          color: '#f9f6f2',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '1rem'
        }}>New Game</button>
      </div>

      <div style={{
        width: 'min(500px, 90vw)',
        height: 'min(500px, 90vw)',
        background: '#bbada0',
        borderRadius: '6px',
        padding: '10px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        gap: '10px',
        position: 'relative'
      }}>
        {board.map((val, idx) => (
          <div key={idx} style={{
            background: getTileColor(val),
            borderRadius: '3px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: val > 512 ? '2rem' : '2.5rem',
            fontWeight: 'bold',
            color: getTileTextColor(val),
            transition: 'all 0.1s ease'
          }}>
            {val !== 0 ? val : ''}
          </div>
        ))}

        {/* Game Over / Won Overlay */}
        {(gameState === 'won' || gameState === 'lost') && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(238, 228, 218, 0.73)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
            borderRadius: '6px'
          }}>
            <h1 style={{ fontSize: '3rem', color: '#776e65', margin: '0 0 20px 0' }}>
              {gameState === 'won' ? 'You Win!' : 'Game Over!'}
            </h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={initGame} style={{
                padding: '15px 30px',
                background: '#8f7a66',
                color: '#f9f6f2',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}>Try Again</button>
              <button onClick={onEndGame} style={{
                 padding: '15px 30px',
                 background: '#f44336',
                 color: '#f9f6f2',
                 border: 'none',
                 borderRadius: '6px',
                 fontWeight: 'bold',
                 cursor: 'pointer',
                 fontSize: '1.2rem'
              }}>Exit</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ color: '#776e65', fontSize: '1.1rem', fontWeight: 500 }}>
        使用键盘方向键 ↑ ↓ ← → 控制移动
      </div>
      <button onClick={onEndGame} style={{
          marginTop: '20px',
          padding: '10px 30px',
          background: 'transparent',
          color: '#776e65',
          border: '2px solid #776e65',
          borderRadius: '20px',
          fontWeight: 'bold',
          cursor: 'pointer'
      }}>退出游戏</button>
    </div>
  );
};

const ClickNumberGame = ({ onEndGame, onRequirePunishment }) => {
  const leftName = localStorage.getItem('couple_left_name') || 'LkbHua';
  const rightName = localStorage.getItem('couple_right_name') || 'ZengQ';
  const [numbers, setNumbers] = useState([]);
  const [expected, setExpected] = useState(1);
  const [gameState, setGameState] = useState('playing'); // 'playing' | 'roundEnded' | 'summary'
  const [startTs, setStartTs] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [wrongTips, setWrongTips] = useState([]);
  const tipIdRef = useRef(0);
  const [currentPlayer, setCurrentPlayer] = useState('left');
  const [leftTime, setLeftTime] = useState(null);
  const [rightTime, setRightTime] = useState(null);
  const [punishmentTriggered, setPunishmentTriggered] = useState(false);
  const [punishmentDone, setPunishmentDone] = useState(false);
  const startRound = () => {
    const arr = Array.from({ length: 25 }, (_, i) => i + 1);
    arr.sort(() => Math.random() - 0.5);
    setNumbers(arr);
    const ts = performance.now();
    setStartTs(ts);
    setGameState('playing');
    setExpected(1);
    setElapsed(0);
    setWrongTips([]);
  };
  useEffect(() => {
    startRound();
    setCurrentPlayer('left');
    setLeftTime(null);
    setRightTime(null);
    setPunishmentTriggered(false);
    setPunishmentDone(false);
  }, []);
  useEffect(() => {
    if (gameState !== 'playing' || startTs == null) return;
    const t = setInterval(() => {
      setElapsed(performance.now() - startTs);
    }, 50);
    return () => clearInterval(t);
  }, [gameState, startTs]);
  const handleCellClick = (value) => {
    if (gameState !== 'playing') return;
    if (value !== expected) {
      const id = tipIdRef.current++;
      const text = String(expected);
      setWrongTips(prev => [...prev, { id, text }]);
      setTimeout(() => {
        setWrongTips(prev => prev.filter(t => t.id !== id));
      }, 1200);
      return;
    }
    const next = expected + 1;
    if (next <= 25) {
      setExpected(next);
    } else {
      const total = performance.now() - startTs;
      setElapsed(total);
      if (currentPlayer === 'left') {
        setLeftTime(total);
      } else {
        setRightTime(total);
      }
      setGameState('roundEnded');
    }
  };
  const proceedAfterRound = () => {
    if (currentPlayer === 'left') {
      setCurrentPlayer('right');
      startRound();
    } else {
      setGameState('summary');
    }
  };
  const format = (ms) => (ms / 1000).toFixed(3) + 's';
  const winner = (leftTime != null && rightTime != null)
    ? (leftTime < rightTime ? 'left' : (rightTime < leftTime ? 'right' : 'draw'))
    : null;
  const loser = winner === 'left' ? 'right' : (winner === 'right' ? 'left' : null);
  useEffect(() => {
    if (gameState === 'summary' && loser && !punishmentTriggered) {
      setPunishmentTriggered(true);
      onRequirePunishment(loser, () => setPunishmentDone(true));
    }
  }, [gameState, loser, punishmentTriggered]);
  const restartAll = () => {
    setCurrentPlayer('left');
    setLeftTime(null);
    setRightTime(null);
    setPunishmentTriggered(false);
    setPunishmentDone(false);
    startRound();
  };
  const runTest = () => {
    setLeftTime(5000);
    setRightTime(6000);
    setPunishmentTriggered(false);
    setPunishmentDone(false);
    setGameState('summary');
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.25)', padding: '10px 20px', borderRadius: '24px', color: '#fff', fontWeight: 'bold' }}>
        <Pointer size={20} /> 点击数字 · 计时 {format(elapsed)} · 当前 {currentPlayer === 'left' ? leftName : rightName} · 下一个 {expected}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={runTest}
          style={{
            padding: '8px 16px',
            borderRadius: '16px',
            border: 'none',
            background: '#FF9800',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Activity size={18} /> 测试（5s/6s）
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: wrongTips.length ? '36px' : 0 }}>
        <AnimatePresence>
          {wrongTips.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              style={{
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '16px',
                padding: '8px 14px',
                color: '#E91E63',
                fontWeight: 800,
                boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
              }}
            >
              需要点击：{t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div style={{ width: 'min(80vw, 520px)', height: 'min(80vw, 520px)', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', padding: '12px' }}>
        {numbers.map((n, idx) => (
          <div
            key={idx}
            onClick={() => handleCellClick(n)}
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#333',
              fontWeight: 800,
              fontSize: '1.4rem',
              cursor: gameState === 'playing' ? 'pointer' : 'default',
              userSelect: 'none',
              aspectRatio: '1 / 1',
              boxShadow: '0 6px 18px rgba(0,0,0,0.12)'
            }}
          >
            {n}
          </div>
        ))}
      </div>
      {gameState === 'roundEnded' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', padding: '20px', color: '#333', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: 'min(520px, 92%)' }}>
            <div style={{ fontWeight: 800, color: '#3F51B5' }}>本轮完成用时（{currentPlayer === 'left' ? leftName : rightName}）</div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{format(currentPlayer === 'left' ? leftTime : rightTime)}</div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button onClick={proceedAfterRound} style={{ padding: '12px 24px', borderRadius: '20px', border: 'none', background: '#3F51B5', color: '#fff', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
                {currentPlayer === 'left' ? '继续下一轮' : '查看结算'}
              </button>
              <button onClick={onEndGame} style={{ padding: '12px 24px', borderRadius: '20px', background: 'transparent', color: '#333', fontWeight: 'bold', cursor: 'pointer', border: '2px solid rgba(0,0,0,0.2)' }}>
                退出游戏
              </button>
            </div>
          </div>
        </div>
      )}
      {gameState === 'summary' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', padding: '20px', color: '#333', width: 'min(640px, 94%)' }}>
            <div style={{ fontWeight: 800, marginBottom: '10px', color: '#3F51B5' }}>结算</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ background: 'rgba(0,0,0,0.05)', padding: '10px', fontWeight: 700 }}>玩家</div>
              <div style={{ background: 'rgba(0,0,0,0.05)', padding: '10px', fontWeight: 700 }}>用时</div>
              <div style={{ padding: '10px' }}>{leftName}</div>
              <div style={{ padding: '10px' }}>{leftTime != null ? format(leftTime) : '--'}</div>
              <div style={{ padding: '10px' }}>{rightName}</div>
              <div style={{ padding: '10px' }}>{rightTime != null ? format(rightTime) : '--'}</div>
            </div>
            <div style={{ marginTop: '10px', fontWeight: 800, color: '#4CAF50' }}>
              {winner === 'left' ? `${leftName} 获胜` : winner === 'right' ? `${rightName} 获胜` : '平局'}
            </div>
            {!punishmentDone && loser && (
              <div style={{ marginTop: '10px', fontWeight: 700, color: '#E91E63' }}>{loser === 'left' ? leftName : rightName} 需完成惩罚后才能继续</div>
            )}
            {punishmentDone && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button onClick={restartAll} style={{ padding: '12px 24px', borderRadius: '20px', border: 'none', background: '#3F51B5', color: '#fff', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
                  再来一遍
                </button>
                <button onClick={onEndGame} style={{ padding: '12px 24px', borderRadius: '20px', background: 'transparent', color: '#333', fontWeight: 'bold', cursor: 'pointer', border: '2px solid rgba(0,0,0,0.2)' }}>
                  退出游戏
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
const ColorChangeGame = ({ onEndGame, onRequirePunishment }) => {
  const leftName = localStorage.getItem('couple_left_name') || 'LkbHua';
  const rightName = localStorage.getItem('couple_right_name') || 'ZengQ';
  const [boxColor, setBoxColor] = useState('#FFC0CB');
  const [gameState, setGameState] = useState('playing');
  const [roundIndex, setRoundIndex] = useState(0);
  const [playerTrial, setPlayerTrial] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState('left');
  const [timesLeft, setTimesLeft] = useState([[], []]);
  const [timesRight, setTimesRight] = useState([[], []]);
  const [lastMs, setLastMs] = useState(0);
  const [startTs, setStartTs] = useState(null);
  const [awaitClick, setAwaitClick] = useState(false);
  const [showResult, setShowResult] = useState(false);
  useEffect(() => {
    setCurrentPlayer(roundIndex === 0 ? 'left' : 'right');
  }, [roundIndex]);
  const scheduleGreen = () => {
    setBoxColor('#FFC0CB');
    setAwaitClick(false);
    setStartTs(null);
    const delay = Math.floor(800 + Math.random() * 2200);
    setTimeout(() => {
      setBoxColor('#4CAF50');
      setStartTs(performance.now());
      setAwaitClick(true);
    }, delay);
  };
  useEffect(() => {
    if (gameState === 'playing' && !awaitClick && startTs === null && !showResult) {
      scheduleGreen();
    }
  }, [gameState, awaitClick, startTs, showResult]);
  const recordTime = (ms) => {
    if (currentPlayer === 'left') {
      setTimesLeft(prev => {
        const n = prev.map(arr => [...arr]);
        n[roundIndex].push(ms);
        return n;
      });
    } else {
      setTimesRight(prev => {
        const n = prev.map(arr => [...arr]);
        n[roundIndex].push(ms);
        return n;
      });
    }
  };
  const handleClick = () => {
    if (!awaitClick) return;
    const now = performance.now();
    const ms = Math.max(1, Math.round(now - startTs));
    setLastMs(ms);
    recordTime(ms);
    setAwaitClick(false);
    setStartTs(null);
    setShowResult(true);
  };
  const handleContinue = () => {
    const nextTrial = playerTrial + 1;
    setShowResult(false);
    if (nextTrial < 5) {
      setPlayerTrial(nextTrial);
      scheduleGreen();
      return;
    }
    const nextRound = roundIndex + 1;
    if (nextRound < 2) {
      setRoundIndex(nextRound);
      setPlayerTrial(0);
      scheduleGreen();
      return;
    }
    setGameState('ended');
  };
  const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const avgLeftRound1 = avg(timesLeft[0]);
  const avgLeftRound2 = avg(timesLeft[1]);
  const avgRightRound1 = avg(timesRight[0]);
  const avgRightRound2 = avg(timesRight[1]);
  const avgLeftAll = avg([...timesLeft[0], ...timesLeft[1]]);
  const avgRightAll = avg([...timesRight[0], ...timesRight[1]]);
  const winner = avgLeftAll && avgRightAll ? (avgLeftAll < avgRightAll ? 'left' : (avgRightAll < avgLeftAll ? 'right' : 'draw')) : null;
  const loser = winner === 'left' ? 'right' : (winner === 'right' ? 'left' : null);
  const [punishmentDone, setPunishmentDone] = useState(false);
  const [punishmentTriggered, setPunishmentTriggered] = useState(false);
  useEffect(() => {
    if (gameState === 'ended' && loser && !punishmentTriggered) {
      setPunishmentTriggered(true);
      onRequirePunishment(loser, () => setPunishmentDone(true));
    }
  }, [gameState, loser, punishmentTriggered]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.25)', padding: '10px 20px', borderRadius: '24px', color: '#fff', fontWeight: 'bold' }}>
        <Activity size={20} /> 颜色变化 · 轮 {roundIndex + 1} / 2 · {currentPlayer === 'left' ? leftName : rightName} · 反应 {lastMs ? (lastMs / 1000).toFixed(3) + 's' : '--'}
      </div>
      {gameState === 'playing' && (
        <motion.div
          key={boxColor + String(awaitClick) + String(showResult)}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          onClick={handleClick}
          style={{
            width: 'min(70vw, 520px)',
            height: 'min(70vw, 520px)',
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            background: boxColor,
            border: '1px solid rgba(255,255,255,0.3)',
            cursor: awaitClick ? 'pointer' : 'default'
          }}
        />
      )}
      {gameState === 'playing' && showResult && (
        <div style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', padding: '16px', color: '#333' }}>
          <div style={{ fontWeight: 800, marginBottom: '8px', color: '#4CAF50' }}>本次反应时间</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '10px' }}>{(lastMs/1000).toFixed(3)}s</div>
          <button onClick={handleContinue} style={{ padding: '10px 22px', borderRadius: '18px', border: 'none', background: '#00BCD4', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
            继续
          </button>
        </div>
      )}
      {gameState === 'ended' && (
        <div style={{ background: 'rgba(255,255,255,0.95)', padding: '20px', borderRadius: '24px', width: 'min(720px, 95%)', color: '#333', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', border: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ fontWeight: 800, marginBottom: '12px', color: '#00BCD4' }}>结算</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '16px', padding: '12px' }}>
              <div style={{ fontWeight: 800, marginBottom: '6px' }}>{leftName}</div>
              <div style={{ fontWeight: 700, marginBottom: '6px' }}>第1轮</div>
              <div style={{ marginBottom: '6px' }}>{timesLeft[0].map(ms => (ms / 1000).toFixed(3) + 's').join('，')}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>平均：{(avgLeftRound1/1000).toFixed(3)}s</div>
              <div style={{ fontWeight: 700, marginTop: '10px', marginBottom: '6px' }}>第2轮</div>
              <div style={{ marginBottom: '6px' }}>{timesLeft[1].map(ms => (ms / 1000).toFixed(3) + 's').join('，')}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>平均：{(avgLeftRound2/1000).toFixed(3)}s</div>
              <div style={{ marginTop: '8px', fontWeight: 700 }}>综合平均：{(avgLeftAll/1000).toFixed(3)}s</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '16px', padding: '12px' }}>
              <div style={{ fontWeight: 800, marginBottom: '6px' }}>{rightName}</div>
              <div style={{ fontWeight: 700, marginBottom: '6px' }}>第1轮</div>
              <div style={{ marginBottom: '6px' }}>{timesRight[0].map(ms => (ms / 1000).toFixed(3) + 's').join('，')}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>平均：{(avgRightRound1/1000).toFixed(3)}s</div>
              <div style={{ fontWeight: 700, marginTop: '10px', marginBottom: '6px' }}>第2轮</div>
              <div style={{ marginBottom: '6px' }}>{timesRight[1].map(ms => (ms / 1000).toFixed(3) + 's').join('，')}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>平均：{(avgRightRound2/1000).toFixed(3)}s</div>
              <div style={{ marginTop: '8px', fontWeight: 700 }}>综合平均：{(avgRightAll/1000).toFixed(3)}s</div>
            </div>
          </div>
          <div style={{ marginTop: '12px', fontWeight: 800, color: '#4CAF50' }}>
            {winner === 'left' ? `${leftName} 获胜` : winner === 'right' ? `${rightName} 获胜` : '平局'}
          </div>
          {!punishmentDone && loser && (
            <div style={{ marginTop: '10px', fontWeight: 700, color: '#E91E63' }}>{loser === 'left' ? leftName : rightName} 需完成惩罚后才能继续</div>
          )}
          {punishmentDone && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button
                onClick={() => {
                  setBoxColor('#FFC0CB');
                  setGameState('playing');
                  setRoundIndex(0);
                  setPlayerTrial(0);
                  setCurrentPlayer('left');
                  setTimesLeft([[], []]);
                  setTimesRight([[], []]);
                  setLastMs(0);
                  setStartTs(null);
                  setAwaitClick(false);
                  setPunishmentDone(false);
                  setPunishmentTriggered(false);
                }}
                style={{ padding: '12px 24px', borderRadius: '20px', border: 'none', background: '#00BCD4', color: '#fff', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}
              >
                再来一遍
              </button>
              <button
                onClick={onEndGame}
                style={{ padding: '12px 24px', borderRadius: '20px', background: 'transparent', color: '#333', fontWeight: 'bold', cursor: 'pointer', border: '2px solid rgba(0,0,0,0.2)' }}
              >
                退出游戏
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Witch Game Component - Poison Picker
const WitchGame = ({ onEndGame, onRequirePunishment, itemCount = 16, poisonCount = 1 }) => {
  // Game Configuration
  const ITEMS_COUNT = Math.min(100, Math.max(16, itemCount % 2 === 0 ? itemCount : itemCount - 1));
  const [itemsCount, setItemsCount] = useState(ITEMS_COUNT);
  const TILE_SIZE = 70;
  const GAP = 15;
  const [dynamicColumns, setDynamicColumns] = useState(Math.min(10, Math.max(4, Math.floor(Math.sqrt(itemsCount)))));

  // Game State
  const [gameState, setGameState] = useState('config'); // 'config' -> 'setup' -> 'playing' -> 'ended'
  const [items, setItems] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('left'); // 'left' or 'right'
  const [turnPlayer, setTurnPlayer] = useState('left'); // Who is picking currently in 'playing' phase
  const [setupPhase, setSetupPhase] = useState('left'); // 'left' then 'right' picking poison
  const [winner, setWinner] = useState(null);
  const [poisonRevealed, setPoisonRevealed] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [configItemCount, setConfigItemCount] = useState(ITEMS_COUNT);
  const [poisonCountState, setPoisonCountState] = useState(Math.min(5, Math.max(1, poisonCount)));

  useEffect(() => {
    const compute = () => {
      const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const height = typeof window !== 'undefined' ? window.innerHeight : 800;
      const headerSpace = 180;
      const footerSpace = 120;
      const paddingSpace = 80;
      const maxRows = Math.max(3, Math.floor((height - headerSpace - footerSpace - paddingSpace) / (TILE_SIZE + GAP)));
      const maxColsByWidth = Math.max(4, Math.floor(((width * 0.95) - 40) / (TILE_SIZE + GAP)));
      let cols = Math.max(4, Math.min(20, Math.ceil(itemsCount / Math.max(3, maxRows))));
      cols = Math.min(cols, maxColsByWidth);
      setDynamicColumns(cols);
    };
    compute();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', compute);
      return () => window.removeEventListener('resize', compute);
    }
  }, [itemsCount]);

  // Cute item pool (emoji-based)
  const ITEM_POOL = [
    { name: '苹果', emoji: '🍎' }, { name: '橘子', emoji: '🍊' }, { name: '梨子', emoji: '🍐' }, { name: '西瓜', emoji: '🍉' },
    { name: '香蕉', emoji: '🍌' }, { name: '葡萄', emoji: '🍇' }, { name: '哈密瓜', emoji: '🍈' }, { name: '点心', emoji: '🍪' },
    { name: '蛋糕', emoji: '🍰' }, { name: '雨伞', emoji: '☂️' }, { name: '男人', emoji: '👨' }, { name: '女人', emoji: '👩' },
    { name: '熊', emoji: '🐻' }, { name: '兔子', emoji: '🐰' }, { name: '猫', emoji: '🐱' }, { name: '狐狸', emoji: '🦊' },
    { name: '老虎', emoji: '🐯' }, { name: '狗', emoji: '🐶' }, { name: '鞋子', emoji: '👠' }, { name: '自行车', emoji: '🚲' },
    { name: '轿车', emoji: '🚗' }, { name: '卡车', emoji: '🚚' }, { name: '巴士', emoji: '🚌' }, { name: '火车', emoji: '🚆' },
    { name: '飞机', emoji: '✈️' }, { name: '爱心', emoji: '💖' }, { name: '星星', emoji: '⭐' }, { name: '小熊软糖', emoji: '🧸' },
    { name: '雪人', emoji: '⛄' }, { name: '气球', emoji: '🎈' }
  ];

  // Confirm configuration and initialize board
  const confirmConfig = () => {
    const evenCount = configItemCount % 2 === 0 ? configItemCount : (configItemCount - 1);
    const finalCount = Math.min(100, Math.max(16, evenCount));
    setItemsCount(finalCount);
    setPoisonCountState(Math.min(5, Math.max(1, poisonCountState)));
    const typeCount = Math.random() < 0.6 ? 2 : 3;
    const indices = [];
    while (indices.length < typeCount) {
      const idx = Math.floor(Math.random() * ITEM_POOL.length);
      if (!indices.includes(idx)) indices.push(idx);
    }
    const types = indices.map(i => ITEM_POOL[i]);
    setSelectedTypes(types);
    const newItems = Array.from({ length: finalCount }, () => {
      const t = types[Math.floor(Math.random() * types.length)];
      return { status: 'active', isPoisonA: false, isPoisonB: false, type: t };
    });
    setItems(newItems);
    setGameState('setup');
    setSetupPhase('left');
    setTurnPlayer('left');
    setWinner(null);
    setPoisonRevealed(false);
  };

  // User Info
  const leftName = localStorage.getItem('couple_left_name') || 'LkbHua';
  const rightName = localStorage.getItem('couple_right_name') || 'ZengQ';
  const leftAvatar = localStorage.getItem('couple_left_avatar');
  const rightAvatar = localStorage.getItem('couple_right_avatar');

  // Icons for items (using diverse icons for visual interest)
  const getItemEmoji = (item) => item?.type?.emoji || '💠';

  // Sound effects (simulated with visual feedback for now)

  const handleItemClick = (index) => {
    if (gameState === 'setup') {
      handleSetupClick(index);
    } else if (gameState === 'playing') {
      handlePlayClick(index);
    }
  };

  const handleSetupClick = (index) => {
    // Prevent selecting same item twice if needed, or just overwrite
    // Here we allow re-selection until confirmed
    const newItems = [...items];
    
    // Clear previous selection for current setup player
    if (setupPhase === 'left') {
        newItems[index].isPoisonA = !newItems[index].isPoisonA;
        // Limit to poisonCount by turning off oldest selections if exceed
        const selected = newItems.map((i, idx) => ({ idx, sel: i.isPoisonA })).filter(x => x.sel).map(x => x.idx);
        if (selected.length > poisonCountState) {
          newItems[selected[0]].isPoisonA = false;
        }
    } else {
        newItems[index].isPoisonB = !newItems[index].isPoisonB;
        const selected = newItems.map((i, idx) => ({ idx, sel: i.isPoisonB })).filter(x => x.sel).map(x => x.idx);
        if (selected.length > poisonCountState) {
          newItems[selected[0]].isPoisonB = false;
        }
    }
    setItems(newItems);
  };

  const confirmSetup = () => {
    // Check if current setup player has selected a poison
    const selectedCount = items.filter(i => setupPhase === 'left' ? i.isPoisonA : i.isPoisonB).length;
    if (selectedCount !== poisonCountState) {
        alert(`需设置 ${poisonCountState} 个毒药（当前已选 ${selectedCount} 个）`);
        return;
    }

    if (setupPhase === 'left') {
        setSetupPhase('right');
        // Clear visual selection for privacy (logic remains)
        // In a real app, maybe show an interstitial "Pass device to Player B"
    } else {
        setGameState('playing');
        setTurnPlayer('left'); // Left starts picking to eat
    }
  };

  const handlePlayClick = (index) => {
    if (items[index].status === 'eaten') return;

    const selectedItem = items[index];
    const isPoisonForCurrentTurn = turnPlayer === 'left' ? selectedItem.isPoisonB : selectedItem.isPoisonA;
    // Note: Rule says "Select opponent's poison -> Lose".
    // Player Left loses if they pick item marked as PoisonB (set by Right).
    
    // Also need to handle self-poison? Usually logic is "Don't eat the poison".
    // If I eat my own poison? Usually allowed, but let's stick to "Opponent's poison is the danger".
    // Wait, prompt says: "Who unluckily selects the 'poison' set by the OTHER party, loses."
    
    // Update item status to eaten
    const newItems = [...items];
    newItems[index] = { ...newItems[index], status: 'eaten' };
    setItems(newItems);

    if (isPoisonForCurrentTurn) {
        // BOOM! Lost.
        setPoisonRevealed(true);
        setWinner(turnPlayer === 'left' ? 'right' : 'left'); // Opponent wins
        setGameState('ended');
        
        // Trigger punishment
        setTimeout(() => {
             if (onRequirePunishment) {
               onRequirePunishment(turnPlayer === 'left' ? 'left' : 'right');
             }
        }, 1500);
    } else {
        // Safe. Switch turn.
        setTurnPlayer(turnPlayer === 'left' ? 'right' : 'left');
    }
  };

  // Helper to check if item is currently selected in setup phase (for visual feedback)
  const isSelectedInSetup = (item) => {
      if (gameState !== 'setup') return false;
      if (setupPhase === 'left') return item.isPoisonA;
      if (setupPhase === 'right') return item.isPoisonB;
      return false;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#fff',
      gap: '20px',
      width: '100%'
    }}>
      {/* Header / Status */}
      <div style={{ 
          background: 'rgba(0,0,0,0.3)', 
          padding: '10px 30px', 
          borderRadius: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
      }}>
          {gameState === 'config' ? (
              <>
                <Ghost size={24} color="#E040FB" />
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    配置游戏参数
                </span>
              </>
          ) : gameState === 'setup' ? (
              <>
                <Ghost size={24} color="#E040FB" />
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {setupPhase === 'left' ? leftName : rightName} 请设置毒药（需设置 {poisonCountState} 个）
                </span>
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>(对方请闭眼)</span>
              </>
          ) : gameState === 'playing' ? (
              <>
                <img 
                    src={turnPlayer === 'left' ? leftAvatar : rightAvatar} 
                    alt="avatar" 
                    style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid #fff' }}
                />
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    轮到 {turnPlayer === 'left' ? leftName : rightName} 选择
                </span>
              </>
          ) : (
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FF5252' }}>
                  {winner === 'left' ? leftName : rightName} 获胜!
              </span>
          )}
      </div>

      {/* Config Panel */}
      {gameState === 'config' && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.6)',
          width: 'min(700px, 90%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          <div style={{ textAlign: 'center', color: '#333', fontWeight: 800 }}>
            女巫的毒药：游戏参数
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '300px' }}>
              <div style={{ marginBottom: '8px', fontWeight: 700, color: '#4A148C' }}>物品数量（16-100，偶数）：</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {[16,20,24,28,32,36,40,44,48,52,56,60,64,68,72,76,80,84,88,92,96,100].map(cnt => (
                  <motion.button
                    key={cnt}
                    whileHover={{ y: -2, scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setConfigItemCount(cnt)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '14px',
                      border: configItemCount === cnt ? '2px solid #9C27B0' : '1px solid rgba(0,0,0,0.08)',
                      background: 'rgba(255,255,255,0.95)',
                      boxShadow: configItemCount === cnt ? '0 6px 20px rgba(156,39,176,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                      color: '#333',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    {cnt}
                  </motion.button>
                ))}
              </div>
            </div>
            <div style={{ minWidth: '260px' }}>
              <div style={{ marginBottom: '8px', fontWeight: 700, color: '#4A148C' }}>毒药个数（每位玩家）：</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {[1,2,3,4,5].map(pc => (
                  <motion.button
                    key={pc}
                    whileHover={{ y: -2, scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPoisonCountState(pc)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '14px',
                      border: poisonCountState === pc ? '2px solid #9C27B0' : '1px solid rgba(0,0,0,0.08)',
                      background: 'rgba(255,255,255,0.95)',
                      boxShadow: poisonCountState === pc ? '0 6px 20px rgba(156,39,176,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                      color: '#333',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    {pc}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', color: '#666', fontSize: '0.95rem' }}>
            物品类型每局随机挑选 2-3 种，风格偏可爱俏皮
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={confirmConfig}
              style={{
                padding: '12px 40px',
                borderRadius: '20px',
                border: 'none',
                background: '#4CAF50',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 8px 20px rgba(76, 175, 80, 0.3)'
              }}
            >
              开始设置毒药 <Play size={18} />
            </motion.button>
          </div>
        </div>
      )}

      {/* Grid */}
      {gameState !== 'config' && <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${dynamicColumns}, ${TILE_SIZE}px)`,
          gap: `${GAP}px`,
          padding: '20px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          width: `${Math.min(typeof window !== 'undefined' ? window.innerWidth * 0.95 : 1200, dynamicColumns * TILE_SIZE + (dynamicColumns - 1) * GAP + 40)}px`
      }}>
          {items.map((item, index) => (
              <motion.div
                  key={index}
                  whileHover={{ scale: (item.status === 'active' && gameState !== 'ended') ? 1.05 : 1 }}
                  whileTap={{ scale: (item.status === 'active' && gameState !== 'ended') ? 0.95 : 1 }}
                  onClick={() => handleItemClick(index)}
                   style={{
                       width: `${TILE_SIZE}px`,
                       height: `${TILE_SIZE}px`,
                      borderRadius: '15px',
                      background: item.status === 'eaten' 
                          ? 'rgba(0,0,0,0.2)' 
                          : isSelectedInSetup(item) 
                              ? '#E040FB' // Highlight selection during setup
                              : 'rgba(255,255,255,0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: (item.status === 'active' && gameState !== 'ended') ? 'pointer' : 'default',
                      opacity: item.status === 'eaten' ? 0.5 : 1,
                      position: 'relative',
                      boxShadow: isSelectedInSetup(item) ? '0 0 15px #E040FB' : '0 4px 10px rgba(0,0,0,0.1)',
                      border: isSelectedInSetup(item) ? '2px solid #fff' : 'none'
                  }}
              >
                   <div style={{ 
                       color: isSelectedInSetup(item) ? '#fff' : '#9C27B0',
                       opacity: item.status === 'eaten' ? 0.3 : 1,
                       fontSize: '28px',
                       lineHeight: '1'
                   }}>
                       {poisonRevealed && (item.isPoisonA || item.isPoisonB) ? (
                           <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                               <Bomb size={36} color="#FF5252" />
                               <div style={{ position: 'absolute', bottom: -5, fontSize: '0.7rem', color: '#FF5252', fontWeight: 'bold' }}>
                                   {item.isPoisonA && item.isPoisonB ? '双毒' : (item.isPoisonA ? leftName : rightName)}
                               </div>
                           </div>
                       ) : (
                           getItemEmoji(item)
                       )}
                   </div>
              </motion.div>
          ))}
      </div>}

      {/* Action Area */}
      <div style={{ height: '60px', display: 'flex', alignItems: 'center' }}>
          {gameState === 'setup' && (
              <button onClick={confirmSetup} style={{
                  padding: '12px 40px',
                  background: '#E040FB',
                  color: 'white',
                  border: 'none',
                  borderRadius: '30px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 5px 15px rgba(224, 64, 251, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
              }}>
                  {setupPhase === 'left' ? '确认设置 (交给对方)' : '确认设置 (开始游戏)'} <ArrowUp size={20} />
              </button>
          )}
          
          {gameState === 'ended' && (
               <button onClick={onEndGame} style={{
                  padding: '12px 30px',
                  background: 'transparent',
                  color: '#fff',
                  border: '2px solid rgba(255,255,255,0.5)',
                  borderRadius: '25px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
               }}>
                  退出游戏
               </button>
          )}
      </div>

      {/* Rules Hint */}
       {gameState === 'setup' && (
           <div style={{ fontSize: '0.9rem', opacity: 0.8, maxWidth: '420px', textAlign: 'center' }}>
               本局物品类型：{selectedTypes.map(t => t.name).join(' / ')}。每位玩家需设置 {poisonCountState} 个“毒药”。若在轮到你时挑中了对方的毒药，你将失败并进入惩罚环节。
           </div>
       )}
    </div>
  );
};

// Truth or Dare Game Component
const TruthOrDareGame = ({ onEndGame, mode, isLocked, onBackToMode }) => {
  const [currentPlayer, setCurrentPlayer] = useState('left'); // 'left' or 'right'
  const [gameState, setGameState] = useState('idle'); // 'idle', 'spinning', 'revealed', 'choosing_type', 'rps_result'
  const [currentCard, setCurrentCard] = useState(null); // { type: 'truth' | 'dare', content: '' }
  const [startMode, setStartMode] = useState('dice'); // 'dice' | 'rps'
  
  // RPS State
  const [rpsHands, setRpsHands] = useState({ left: null, right: null });
  const [rpsStats, setRpsStats] = useState({ left: 0, right: 0 });
  const [rpsResult, setRpsResult] = useState(null); // 'left_win', 'right_win', 'draw'
  const [openBank, setOpenBank] = useState(null); // 'truth', 'dare', or null
  const [completedQuestions, setCompletedQuestions] = useState([]); // Track completed questions content
  
  // Custom Questions State
  const [truthList, setTruthList] = useState([]);
  const [dareList, setDareList] = useState([]);
  
  // Initialize lists based on mode
  useEffect(() => {
    if (mode === '热恋版') {
      setTruthList(HOT_TRUTHS);
      setDareList(HOT_DARES);
    } else if (mode === '亲密版') {
      setTruthList(INTIMATE_TRUTHS);
      setDareList(INTIMATE_DARES);
    } else {
      setTruthList(GENTLE_TRUTHS);
      setDareList(GENTLE_DARES);
    }
  }, [mode]);

  const [isCustomInputOpen, setIsCustomInputOpen] = useState(false);
  const [customInputType, setCustomInputType] = useState('truth');
  const [customInputContent, setCustomInputContent] = useState('');

  // Get names/avatars from localStorage
  const leftName = localStorage.getItem('couple_left_name') || 'LkbHua';
  const rightName = localStorage.getItem('couple_right_name') || 'ZengQ';
  const leftAvatar = localStorage.getItem('couple_left_avatar');
  const rightAvatar = localStorage.getItem('couple_right_avatar');

  const handleSpin = () => {
    setGameState('spinning');
    
    if (startMode === 'dice') {
        // Mode 1: Dice + Orbit (Random Player + Random Type)
        setTimeout(() => {
            const players = ['left', 'right'];
            const types = ['truth', 'dare'];
            
            const selectedPlayer = players[Math.floor(Math.random() * players.length)];
            const selectedType = types[Math.floor(Math.random() * types.length)];
            
            const list = selectedType === 'truth' ? truthList : dareList;
            const randomContent = list[Math.floor(Math.random() * list.length)];
            
            setCurrentPlayer(selectedPlayer);
            setCurrentCard({ type: selectedType, content: randomContent });
            setGameState('revealed');
        }, 2000); // 2 seconds spin
    } else {
        // Mode 2: RPS (Rock Paper Scissors)
        // Reset previous result
        setRpsResult(null);
        setRpsHands({ left: null, right: null });
        
        setTimeout(() => {
            const hands = ['rock', 'paper', 'scissors'];
            const leftHand = hands[Math.floor(Math.random() * hands.length)];
            const rightHand = hands[Math.floor(Math.random() * hands.length)];
            
            setRpsHands({ left: leftHand, right: rightHand });
            
            // Determine winner
            let result = 'draw';
            if (leftHand !== rightHand) {
                if (
                    (leftHand === 'rock' && rightHand === 'scissors') ||
                    (leftHand === 'paper' && rightHand === 'rock') ||
                    (leftHand === 'scissors' && rightHand === 'paper')
                ) {
                    result = 'left_win';
                    setRpsStats(prev => ({ ...prev, left: prev.left + 1 }));
                } else {
                    result = 'right_win';
                    setRpsStats(prev => ({ ...prev, right: prev.right + 1 }));
                }
            }
            
            setRpsResult(result);
            setGameState('rps_result');
            
            // If not draw, loser gets penalty
            if (result !== 'draw') {
                const loser = result === 'left_win' ? 'right' : 'left';
                setCurrentPlayer(loser);
                
                // Randomly assign Truth or Dare to the loser after a short delay
                setTimeout(() => {
                     // Randomly select type and content
                     const types = ['truth', 'dare'];
                     const selectedType = types[Math.floor(Math.random() * types.length)];
                     
                     const list = selectedType === 'truth' ? truthList : dareList;
                     const randomContent = list[Math.floor(Math.random() * list.length)];
                     
                     setCurrentCard({ type: selectedType, content: randomContent });
                     setGameState('revealed');
                }, 2000); // Show RPS result for 2 seconds
            }
            // If draw, stay in rps_result state (user can click button to retry) or auto-retry? 
            // Let's let user click again or auto-reset. 
            // For simplicity, let's auto-reset to idle if draw after delay? 
            // Or just show "Draw" and let user click button again. 
            // User can click the main button again if state goes back to idle.
            // But if it's draw, we probably want to let them re-roll quickly.
            // Let's just keep the button active if it's draw?
            // Actually, handleSpin checks if gameState === 'idle'.
            else {
                 setTimeout(() => {
                     setGameState('idle');
                 }, 1500);
            }
            
        }, 2000); // 2 seconds animation
    }
  };

  const handleTypeChoice = (type) => {
      const list = type === 'truth' ? truthList : dareList;
      const randomContent = list[Math.floor(Math.random() * list.length)];
      setCurrentCard({ type, content: randomContent });
      setGameState('revealed');
  };

  const handleAddCustomQuestion = () => {
    if (!customInputContent.trim()) return;
    
    if (customInputType === 'truth') {
        setTruthList(prev => [customInputContent, ...prev]);
        setOpenBank('truth');
    } else {
        setDareList(prev => [customInputContent, ...prev]);
        setOpenBank('dare');
    }
    setCustomInputContent('');
    // setIsCustomInputOpen(false); // Keep open for convenience as per user hint "expandable component"
  };

  const handleNextTurn = () => {
    if (currentCard) {
      setCompletedQuestions(prev => {
        if (!prev.includes(currentCard.content)) {
          return [...prev, currentCard.content];
        }
        return prev;
      });
    }
    setGameState('idle');
    setCurrentCard(null);
    // In random mode, next turn also starts from idle spin
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '20px',
        width: '100%',
        height: '100%',
        padding: '140px 20px 20px 20px',
        boxSizing: 'border-box',
      }}
    >
      {/* Mode Toggle Switch */}
      {gameState === 'idle' && (
          <div style={{
              position: 'absolute',
              top: '90px',
              right: '20px',
              zIndex: 100,
              display: 'flex',
              gap: '10px'
          }}>
              {/* Mode Indicator */}
              <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '8px 15px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                  当前模式：{mode}
              </div>

              {/* Back Button */}
              <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onBackToMode}
                  style={{
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: 'white',
                      padding: '8px 15px',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
              >
                  <ArrowLeft size={16} /> 返回
              </motion.button>
          </div>
      )}

      {/* Mode Toggle Switch (Below Back Button) */}
      {gameState === 'idle' && (
          <div style={{ 
              display: 'flex', 
              background: 'rgba(0,0,0,0.2)', 
              borderRadius: '25px', 
              padding: '5px',
              marginBottom: '10px'
          }}>
              <button 
                onClick={() => setStartMode('dice')}
                style={{
                    padding: '8px 20px',
                    borderRadius: '20px',
                    border: 'none',
                    background: startMode === 'dice' ? 'white' : 'transparent',
                    color: startMode === 'dice' ? '#FF69B4' : 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: startMode === 'dice' ? '0 2px 10px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                  骰子模式
              </button>
              <button 
                onClick={() => setStartMode('rps')}
                style={{
                    padding: '8px 20px',
                    borderRadius: '20px',
                    border: 'none',
                    background: startMode === 'rps' ? 'white' : 'transparent',
                    color: startMode === 'rps' ? '#FF69B4' : 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: startMode === 'rps' ? '0 2px 10px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                  猜拳模式
              </button>
          </div>
      )}

      {/* Top Bar with Turn Indicator */}
      <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '500px',
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          padding: '10px 20px',
          borderRadius: '30px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: ((gameState === 'revealed' || gameState === 'choosing_type' || gameState === 'rps_result') && currentPlayer === 'left' && gameState !== 'rps_result') ? 1 : 0.8 }}>
              <div style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', 
                  border: ((gameState === 'revealed' || gameState === 'choosing_type') && currentPlayer === 'left') ? '3px solid #FF69B4' : '2px solid transparent',
                  boxShadow: ((gameState === 'revealed' || gameState === 'choosing_type') && currentPlayer === 'left') ? '0 0 15px #FF69B4' : 'none',
                  transition: 'all 0.3s'
              }}>
                   {leftAvatar ? <img src={leftAvatar} alt="Left" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#6495ED' }} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>{leftName}</span>
                  {startMode === 'rps' && (
                      <span style={{ fontSize: '0.8rem', color: '#FFD700' }}>胜: {rpsStats.left}</span>
                  )}
              </div>
          </div>
          
          <div style={{ fontSize: '1.2rem', color: 'white', fontWeight: 'bold' }}>VS</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: ((gameState === 'revealed' || gameState === 'choosing_type' || gameState === 'rps_result') && currentPlayer === 'right' && gameState !== 'rps_result') ? 1 : 0.8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>{rightName}</span>
                  {startMode === 'rps' && (
                      <span style={{ fontSize: '0.8rem', color: '#FFD700' }}>胜: {rpsStats.right}</span>
                  )}
              </div>
              <div style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden',
                  border: ((gameState === 'revealed' || gameState === 'choosing_type') && currentPlayer === 'right') ? '3px solid #4CAF50' : '2px solid transparent',
                  boxShadow: ((gameState === 'revealed' || gameState === 'choosing_type') && currentPlayer === 'right') ? '0 0 15px #4CAF50' : 'none',
                  transition: 'all 0.3s'
              }}>
                   {rightAvatar ? <img src={rightAvatar} alt="Right" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#FF69B4' }} />}
              </div>
          </div>
      </div>

      <AnimatePresence mode='wait'>
          {(gameState === 'idle' || gameState === 'spinning' || gameState === 'choosing_type' || gameState === 'rps_result') ? (
            <motion.div
              key="spinner"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.5 } }}
              style={{ position: 'relative', width: '300px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                {startMode === 'dice' ? (
                    <>
                        {/* Orbiting Elements Container */}
                        <motion.div
                            animate={gameState === 'spinning' ? { rotate: 360, scale: [1, 0.8, 0.2], opacity: [1, 1, 0] } : { rotate: 0, scale: 1, opacity: 1 }}
                            transition={gameState === 'spinning' ? { duration: 2, ease: "easeInOut" } : { duration: 0 }}
                            style={{ position: 'absolute', width: '100%', height: '100%' }}
                        >
                             {/* Orbit Item 1: Left Avatar (Top) */}
                             <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', border: '2px solid white', boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                                {leftAvatar ? <img src={leftAvatar} alt="L" style={{ width: '100%', height: '100%' }} /> : <div style={{ background: '#6495ED', width: '100%', height: '100%' }} />}
                             </div>
                             {/* Orbit Item 2: Right Avatar (Bottom) */}
                             <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', border: '2px solid white', boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                                {rightAvatar ? <img src={rightAvatar} alt="R" style={{ width: '100%', height: '100%' }} /> : <div style={{ background: '#FF69B4', width: '100%', height: '100%' }} />}
                             </div>
                             {/* Orbit Item 3: Truth Icon (Left) */}
                             <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '50px', height: '50px', borderRadius: '50%', background: '#FF9A9E', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                                <Heart size={24} color="white" />
                             </div>
                             {/* Orbit Item 4: Dare Icon (Right) */}
                             <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: '50px', height: '50px', borderRadius: '50%', background: '#a18cd1', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                                <Zap size={24} color="white" />
                             </div>
                        </motion.div>

                        {/* Central Dice Button */}
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                            animate={gameState === 'spinning' ? { rotate: -360, scale: [1, 1.2, 0], opacity: [1, 1, 0] } : {}}
                            transition={gameState === 'spinning' ? { duration: 2 } : {}}
                            onClick={gameState === 'idle' ? handleSpin : undefined}
                            style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                border: 'none',
                                cursor: gameState === 'idle' ? 'pointer' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 10px 25px rgba(255, 165, 0, 0.4)',
                                zIndex: 10
                            }}
                        >
                            <Dice5 size={40} color="white" />
                        </motion.button>
                    </>
                ) : (
                    <>
                        {/* RPS Mode UI */}
                        
                        {/* Left Hand */}
                        <motion.div
                            animate={gameState === 'spinning' ? { 
                                rotate: [0, -20, 0, -20, 0],
                                x: [0, -10, 0, -10, 0]
                            } : { rotate: 0, x: 0 }}
                            transition={gameState === 'spinning' ? { duration: 0.5, repeat: 3 } : {}}
                            style={{
                                position: 'absolute',
                                left: '20px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: '4rem',
                                zIndex: 5
                            }}
                        >
                            {rpsHands.left === 'rock' ? '✊' : 
                             rpsHands.left === 'paper' ? '✋' : 
                             rpsHands.left === 'scissors' ? '✌️' : '✊'}
                        </motion.div>

                        {/* Right Hand */}
                        <motion.div
                            animate={gameState === 'spinning' ? { 
                                rotate: [0, 20, 0, 20, 0],
                                x: [0, 10, 0, 10, 0],
                                scaleX: -1 
                            } : { rotate: 0, x: 0, scaleX: -1 }}
                            transition={gameState === 'spinning' ? { duration: 0.5, repeat: 3 } : {}}
                            style={{
                                position: 'absolute',
                                right: '20px',
                                top: '50%',
                                transform: 'translateY(-50%) scaleX(-1)', // Flip horizontally to face left
                                fontSize: '4rem',
                                zIndex: 5
                            }}
                        >
                            {rpsHands.right === 'rock' ? '✊' : 
                             rpsHands.right === 'paper' ? '✋' : 
                             rpsHands.right === 'scissors' ? '✌️' : '✊'}
                        </motion.div>

                        {/* Result / VS Text */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: 'white',
                            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                            zIndex: 10
                        }}>
                            {gameState === 'idle' ? 'VS' : 
                             gameState === 'spinning' ? '...' : 
                             rpsResult === 'draw' ? '平局!' : 
                             rpsResult === 'left_win' ? `${leftName} 胜!` : 
                             rpsResult === 'right_win' ? `${rightName} 胜!` : ''}
                        </div>

                        {/* Start Button */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={gameState === 'idle' ? handleSpin : undefined}
                            disabled={gameState !== 'idle'}
                            style={{
                                position: 'absolute',
                                bottom: '20px',
                                padding: '10px 30px',
                                borderRadius: '25px',
                                border: 'none',
                                background: gameState === 'idle' ? 'linear-gradient(135deg, #FF69B4, #FFD700)' : '#ccc',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '1.2rem',
                                cursor: gameState === 'idle' ? 'pointer' : 'default',
                                boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                                opacity: gameState === 'idle' ? 1 : 0
                            }}
                        >
                            开始猜拳
                        </motion.button>
                        

                    </>
                )}
            </motion.div>
          ) : (
              <motion.div
                key="revealed"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", damping: 12 }}
                style={{
                    width: '320px',
                    minHeight: '400px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '30px',
                    padding: '30px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                    position: 'relative'
                }}
              >
                  <div style={{ 
                      width: '60px', height: '60px', borderRadius: '20px', 
                      background: currentCard?.type === 'truth' ? '#FF9A9E' : '#a18cd1',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '20px'
                  }}>
                      {currentCard?.type === 'truth' ? <Heart size={30} color="white" /> : <Zap size={30} color="white" />}
                  </div>

                  <h3 style={{ margin: 0, color: '#666', fontSize: '1.2rem' }}>
                      {currentCard?.type === 'truth' ? '真心话挑战' : '大冒险挑战'}
                  </h3>

                  <div style={{ 
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      textAlign: 'center', fontSize: '1.4rem', fontWeight: 'bold', color: '#333',
                      lineHeight: '1.6', padding: '20px 0'
                  }}>
                      {currentCard?.content}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNextTurn}
                    style={{
                        width: '100%',
                        padding: '15px',
                        borderRadius: '15px',
                        border: 'none',
                        background: '#4CAF50',
                        color: 'white',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 5px 15px rgba(76, 175, 80, 0.3)'
                    }}
                  >
                      完成挑战
                  </motion.button>
              </motion.div>
          )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onEndGame}
        style={{
          padding: '12px 30px',
          borderRadius: '15px',
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(5px)',
          color: 'white',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: 'auto',
          border: '1px solid rgba(255,255,255,0.3)',
          zIndex: 10
        }}
      >
        <LogOut size={20} /> 退出游戏
      </motion.button>

      {/* Custom Question Input (Left Side) */}
      <div style={{
          position: 'absolute',
          left: '20px',
          top: '140px',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start'
      }}>
         <AnimatePresence mode='wait'>
            {!isCustomInputOpen ? (
                 <motion.button
                     key="add-btn"
                     initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => setIsCustomInputOpen(true)}
                     style={{
                         padding: '10px 20px',
                         borderRadius: '30px',
                         background: 'rgba(255,255,255,0.2)', 
                         backdropFilter: 'blur(10px)',
                         border: '1px solid rgba(255,255,255,0.3)',
                         color: 'white', 
                         display: 'flex', 
                         alignItems: 'center', 
                         justifyContent: 'center',
                         gap: '8px',
                         cursor: 'pointer', 
                         boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                         fontSize: '0.95rem',
                         fontWeight: 'bold'
                     }}
                 >
                     <Plus size={20} /> 添加题目
                 </motion.button>
             ) : (
                <motion.div
                    key="add-form"
                    initial={{ opacity: 0, x: -50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, scale: 0.9 }}
                    style={{
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(15px)',
                        padding: '20px',
                        borderRadius: '20px',
                        width: '250px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        display: 'flex', flexDirection: 'column', gap: '15px'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, color: '#333' }}>添加题目</h4>
                        <button onClick={() => setIsCustomInputOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={18} color="#666" />
                        </button>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', background: '#f0f0f0', padding: '5px', borderRadius: '10px' }}>
                        <button 
                            onClick={() => setCustomInputType('truth')}
                            style={{ 
                                flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                background: customInputType === 'truth' ? '#FF9A9E' : 'transparent',
                                color: customInputType === 'truth' ? 'white' : '#666', fontWeight: 'bold', transition: 'all 0.3s'
                            }}
                        >
                            真心话
                        </button>
                        <button 
                            onClick={() => setCustomInputType('dare')}
                            style={{ 
                                flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                background: customInputType === 'dare' ? '#a18cd1' : 'transparent',
                                color: customInputType === 'dare' ? 'white' : '#666', fontWeight: 'bold', transition: 'all 0.3s'
                            }}
                        >
                            大冒险
                        </button>
                    </div>

                    <textarea
                        value={customInputContent}
                        onChange={(e) => setCustomInputContent(e.target.value)}
                        placeholder="输入内容..."
                        style={{
                            width: '100%', minHeight: '80px', padding: '10px', borderRadius: '10px',
                            border: '1px solid #ddd', resize: 'vertical', fontFamily: 'inherit'
                        }}
                    />

                    <button
                        onClick={handleAddCustomQuestion}
                        disabled={!customInputContent.trim()}
                        style={{
                            width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
                            background: customInputContent.trim() ? '#4CAF50' : '#ccc',
                            color: 'white', fontWeight: 'bold', cursor: customInputContent.trim() ? 'pointer' : 'not-allowed'
                        }}
                    >
                        添加
                    </button>
                </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Question Bank Side Panel */}
      <div style={{
          position: 'absolute',
          right: '20px',
          top: '140px',
          bottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          zIndex: 50,
          pointerEvents: 'none' // Allow clicking through empty space
      }}>
          {/* Truth Bank */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: '20px', pointerEvents: 'auto' }}>
              <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setOpenBank(openBank === 'truth' ? null : 'truth')}
                  style={{
                      padding: '8px 15px',
                      borderRadius: '20px',
                      border: 'none',
                      background: openBank === 'truth' ? '#FF9A9E' : 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      backdropFilter: 'blur(5px)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.9rem'
                  }}
              >
                  <Heart size={16} fill={openBank === 'truth' ? "white" : "none"} /> 真心话题库
              </motion.button>
              
              <AnimatePresence>
                  {openBank === 'truth' && (
                      <motion.div
                          initial={{ opacity: 0, height: 0, scale: 0.9 }}
                          animate={{ opacity: 1, height: 'auto', scale: 1 }}
                          exit={{ opacity: 0, height: 0, scale: 0.9 }}
                          style={{
                              width: '260px',
                              maxHeight: '400px', // Limit height for scrolling
                              overflowY: isLocked ? 'hidden' : 'auto',
                              paddingRight: '5px',
                              scrollbarWidth: 'none', // Hide scrollbar for cleaner look
                              msOverflowStyle: 'none'
                          }}
                      >
                          {truthList.map((item, index) => {
                              const isCompleted = completedQuestions.includes(item);
                              return (
                                  <motion.div
                                      key={index}
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.03 }}
                                      style={{
                                          background: isCompleted ? 'rgba(76, 175, 80, 0.8)' : 'rgba(0, 0, 0, 0.6)',
                                          color: 'white',
                                          padding: '10px 15px',
                                          borderRadius: '20px', // Dynamic Island style
                                          marginBottom: '8px',
                                          backdropFilter: 'blur(10px)',
                                          fontSize: '0.85rem',
                                          lineHeight: '1.4',
                                          border: isCompleted ? '1px solid #4CAF50' : '1px solid rgba(255,255,255,0.1)',
                                          textAlign: 'left',
                                          boxShadow: isCompleted ? '0 0 10px rgba(76, 175, 80, 0.3)' : '0 2px 8px rgba(0,0,0,0.2)',
                                          display: 'flex',
                                          gap: '8px'
                                      }}
                                  >
                                      <span style={{ 
                                          opacity: 0.5, 
                                          fontSize: '0.75rem', 
                                          minWidth: '20px', 
                                          textAlign: 'right',
                                          marginTop: '2px' // Align with text top
                                      }}>
                                          {index + 1}.
                                      </span>
                                      <div style={{ flex: 1 }}>
                                          {item} {isCompleted && <span style={{ fontSize: '0.8rem', marginLeft: '5px' }}>✅</span>}
                                      </div>
                                  </motion.div>
                              );
                          })}
                      </motion.div>
                  )}
              </AnimatePresence>
          </div>

          {/* Dare Bank */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', pointerEvents: 'auto' }}>
               <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setOpenBank(openBank === 'dare' ? null : 'dare')}
                  style={{
                      padding: '8px 15px',
                      borderRadius: '20px',
                      border: 'none',
                      background: openBank === 'dare' ? '#a18cd1' : 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      backdropFilter: 'blur(5px)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.9rem'
                  }}
              >
                  <Zap size={16} fill={openBank === 'dare' ? "white" : "none"} /> 大冒险题库
              </motion.button>
              
              <AnimatePresence>
                  {openBank === 'dare' && (
                      <motion.div
                          initial={{ opacity: 0, height: 0, scale: 0.9 }}
                          animate={{ opacity: 1, height: 'auto', scale: 1 }}
                          exit={{ opacity: 0, height: 0, scale: 0.9 }}
                          style={{
                              width: '260px',
                              maxHeight: '400px',
                              overflowY: isLocked ? 'hidden' : 'auto',
                              paddingRight: '5px',
                              scrollbarWidth: 'none',
                              msOverflowStyle: 'none'
                          }}
                      >
                          {dareList.map((item, index) => {
                              const isCompleted = completedQuestions.includes(item);
                              return (
                                  <motion.div
                                      key={index}
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.03 }}
                                      style={{
                                          background: isCompleted ? 'rgba(156, 39, 176, 0.8)' : 'rgba(0, 0, 0, 0.6)',
                                          color: 'white',
                                          padding: '10px 15px',
                                          borderRadius: '20px',
                                          marginBottom: '8px',
                                          backdropFilter: 'blur(10px)',
                                          fontSize: '0.85rem',
                                          lineHeight: '1.4',
                                          border: isCompleted ? '1px solid #9C27B0' : '1px solid rgba(255,255,255,0.1)',
                                          textAlign: 'left',
                                          boxShadow: isCompleted ? '0 0 10px rgba(156, 39, 176, 0.3)' : '0 2px 8px rgba(0,0,0,0.2)',
                                          display: 'flex',
                                          gap: '8px'
                                      }}
                                  >
                                      <span style={{ 
                                          opacity: 0.5, 
                                          fontSize: '0.75rem', 
                                          minWidth: '20px', 
                                          textAlign: 'right',
                                          marginTop: '2px'
                                      }}>
                                          {index + 1}.
                                      </span>
                                      <div style={{ flex: 1 }}>
                                          {item} {isCompleted && <span style={{ fontSize: '0.8rem', marginLeft: '5px' }}>✅</span>}
                                      </div>
                                  </motion.div>
                              );
                          })}
                      </motion.div>
                  )}
              </AnimatePresence>
          </div>
      </div>
    </motion.div>
  );
};

// Gomoku Game Component
const GomokuGame = ({ onEndGame, gridSize = 15, onRequirePunishment }) => {
  const [board, setBoard] = useState(Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState('black'); // 'black' or 'white'
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [pendingRestart, setPendingRestart] = useState(false);

  const checkWinner = (row, col, player) => {
    const directions = [
      [1, 0],  // horizontal
      [0, 1],  // vertical
      [1, 1],  // diagonal
      [1, -1]  // anti-diagonal
    ];

    for (const [dx, dy] of directions) {
      let count = 1;
      let line = [{r: row, c: col}];

      // Check forward
      for (let i = 1; i < 5; i++) {
        const newRow = row + i * dx;
        const newCol = col + i * dy;
        if (newRow < 0 || newRow >= gridSize || newCol < 0 || newCol >= gridSize || board[newRow][newCol] !== player) break;
        count++;
        line.push({r: newRow, c: newCol});
      }

      // Check backward
      for (let i = 1; i < 5; i++) {
        const newRow = row - i * dx;
        const newCol = col - i * dy;
        if (newRow < 0 || newRow >= gridSize || newCol < 0 || newCol >= gridSize || board[newRow][newCol] !== player) break;
        count++;
        line.push({r: newRow, c: newCol});
      }

      if (count >= 5) {
        setWinningLine(line);
        return true;
      }
    }
    return false;
  };

  const handleCellClick = (row, col) => {
    if (board[row][col] || winner) return;

    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    if (checkWinner(row, col, currentPlayer)) {
      setWinner(currentPlayer);
      if (onRequirePunishment) {
        const loser = currentPlayer === 'black' ? 'white' : 'black';
        onRequirePunishment(loser, () => {
          setPendingRestart(true);
        });
      }
    } else {
      setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
    }
  };

  const resetGame = () => {
    setBoard(Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)));
    setCurrentPlayer('black');
    setWinner(null);
    setWinningLine([]);
    setPendingRestart(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center', // Center vertically
        gap: '20px',
        width: '100%',
        height: '100%', // Take full height of container
        maxWidth: '100vw', // Prevent overflow
        maxHeight: '100vh', // Prevent overflow
        padding: '20px',
        boxSizing: 'border-box', // Ensure padding is included
        // Removed fixed background/border/shadow from container to make it transparent
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        width: '100%', 
        maxWidth: '500px', // Limit width of top bar
        alignItems: 'center', 
        marginBottom: '10px',
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        padding: '10px 20px',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
           <div style={{
             width: '30px', height: '30px', borderRadius: '50%',
             background: 'black', border: currentPlayer === 'black' ? '3px solid #4CAF50' : '2px solid transparent',
             boxShadow: currentPlayer === 'black' ? '0 0 10px #4CAF50' : 'none',
             transition: 'all 0.3s'
           }}/>
           <span style={{ color: currentPlayer === 'black' ? '#000' : '#666', fontWeight: 'bold' }}>黑方</span>
        </div>
        
        {winner ? (
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: winner === 'black' ? '#000' : '#fff', textShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
          >
            {winner === 'black' ? '黑方获胜!' : '白方获胜!'}
          </motion.div>
        ) : (
          <div style={{ fontSize: '1.2rem', color: '#444' }}>VS</div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
           <span style={{ color: currentPlayer === 'white' ? '#fff' : '#666', fontWeight: 'bold' }}>白方</span>
           <div style={{
             width: '30px', height: '30px', borderRadius: '50%',
             background: 'white', border: currentPlayer === 'white' ? '3px solid #4CAF50' : '2px solid transparent',
             boxShadow: currentPlayer === 'white' ? '0 0 10px #4CAF50' : 'none',
             transition: 'all 0.3s'
           }}/>
        </div>
      </div>

      {/* Board */}
      <div style={{
        position: 'relative',
        width: 'min(90vw, calc(100vh - 180px), 500px)', // Restrict height to leave room for header (120px) + controls + padding
        aspectRatio: '1',
        background: '#DEB887', // Burlywood color for board
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.2)', // Move shadow to board
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
      }}>
        {/* Grid Lines */}
        <div style={{
           position: 'absolute', top: '20px', left: '20px', right: '20px', bottom: '20px',
           pointerEvents: 'none'
        }}>
           {Array(gridSize).fill(null).map((_, i) => (
             <React.Fragment key={i}>
               {/* Horizontal line */}
               <div style={{
                 position: 'absolute', top: `${(i / (gridSize - 1)) * 100}%`, left: 0, right: 0, height: '1px', background: '#8B4513'
               }}/>
               {/* Vertical line */}
               <div style={{
                 position: 'absolute', left: `${(i / (gridSize - 1)) * 100}%`, top: 0, bottom: 0, width: '1px', background: '#8B4513'
               }}/>
             </React.Fragment>
           ))}
        </div>

        {/* Cells */}
        {board.map((row, rIndex) => (
          row.map((cell, cIndex) => {
            const isWinningPiece = winningLine.some(pos => pos.r === rIndex && pos.c === cIndex);
            return (
              <div
                key={`${rIndex}-${cIndex}`}
                onClick={() => handleCellClick(rIndex, cIndex)}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  cursor: !cell && !winner ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}
              >
                {cell && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: 1,
                      boxShadow: isWinningPiece ? '0 0 15px 5px gold' : '0 2px 5px rgba(0,0,0,0.3)'
                    }}
                    style={{
                      width: '80%',
                      height: '80%',
                      borderRadius: '50%',
                      background: cell === 'black' 
                        ? 'radial-gradient(circle at 30% 30%, #444, #000)' 
                        : 'radial-gradient(circle at 30% 30%, #fff, #ddd)',
                    }}
                  />
                )}
                {/* Hover effect hint */}
                {!cell && !winner && currentPlayer && (
                  <div className="hover-hint" style={{
                    width: '40%', height: '40%', borderRadius: '50%', 
                    background: currentPlayer === 'black' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.3)',
                    opacity: 0, transition: 'opacity 0.2s'
                  }}/>
                )}
              </div>
            );
          })
        ))}
      </div>

      

      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginTop: '10px',
        width: '100%',
        maxWidth: '500px',
        justifyContent: 'center'
      }}>
        {(() => {
          const controlsLocked = !!winner && !pendingRestart;
          return (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (controlsLocked) return;
                  resetGame();
                }}
                style={{
                  padding: '12px 30px',
                  borderRadius: '15px',
                  border: 'none',
                  background: '#2196F3',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: controlsLocked ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 5px 15px rgba(33, 150, 243, 0.3)',
                  opacity: controlsLocked ? 0.7 : 1
                }}
              >
                <RotateCcw size={20} /> 重新开始
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (controlsLocked) return;
                  onEndGame();
                }}
                style={{
                  padding: '12px 30px',
                  borderRadius: '15px',
                  border: 'none',
                  background: '#FF5252',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: controlsLocked ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 5px 15px rgba(255, 82, 82, 0.3)',
                  opacity: controlsLocked ? 0.7 : 1
                }}
              >
                <LogOut size={20} /> 退出游戏
              </motion.button>
            </>
          );
        })()}
      </div>
    </motion.div>
  );
};

// Minesweeper Game Component
const MinesweeperGame = ({ onEndGame, onRequirePunishment, currentPlayer }) => {
  const [gridSize, setGridSize] = useState(12);
  const [leftMines, setLeftMines] = useState(10);
  const [rightMines, setRightMines] = useState(10);
  const [board, setBoard] = useState([]);
  const [gameState, setGameState] = useState('setup'); // 'setup', 'playing', 'won', 'lost'
  const [flagsLeft, setFlagsLeft] = useState(0);
  const [timer, setTimer] = useState(0);
  const [pendingRestart, setPendingRestart] = useState(false);

  // User names from localStorage
  const leftName = localStorage.getItem('couple_left_name') || 'LkbHua';
  const rightName = localStorage.getItem('couple_right_name') || 'ZengQ';

  // Timer
  useEffect(() => {
    let interval;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const initGame = () => {
    const totalMines = leftMines + rightMines;
    // Safety check: ensure mines don't exceed board size
    const safeMines = Math.min(totalMines, gridSize * gridSize - 1);
    setPendingRestart(false);
    
    // Create empty board
    let newBoard = Array(gridSize).fill().map(() => Array(gridSize).fill(null).map(() => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborCount: 0
    })));

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < safeMines) {
      const r = Math.floor(Math.random() * gridSize);
      const c = Math.floor(Math.random() * gridSize);
      if (!newBoard[r][c].isMine) {
        newBoard[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbors
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (!newBoard[r][c].isMine) {
          let count = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (r + i >= 0 && r + i < gridSize && c + j >= 0 && c + j < gridSize) {
                if (newBoard[r + i][c + j].isMine) count++;
              }
            }
          }
          newBoard[r][c].neighborCount = count;
        }
      }
    }
    setBoard(newBoard);
    setGameState('playing');
    setFlagsLeft(safeMines);
    setTimer(0);
  };

  const revealCell = (r, c) => {
    if (gameState !== 'playing' || board[r][c].isRevealed || board[r][c].isFlagged) return;

    let newBoard = [...board];
    // Copy inner arrays to avoid mutation issues
    newBoard = newBoard.map(row => row.map(cell => ({ ...cell })));

    if (newBoard[r][c].isMine) {
      // Game Over
      newBoard[r][c].isRevealed = true;
      // Reveal all mines
      newBoard.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
          if (cell.isMine) cell.isRevealed = true;
        });
      });
      setBoard(newBoard);
      setGameState('lost');
      if (onRequirePunishment) {
        const loser = currentPlayer || 'left';
        onRequirePunishment(loser, () => {
          setPendingRestart(true);
        });
      }
    } else {
      // Reveal safe cell
      const floodFill = (row, col) => {
        if (row < 0 || row >= gridSize || col < 0 || col >= gridSize || newBoard[row][col].isRevealed || newBoard[row][col].isFlagged) return;
        
        newBoard[row][col].isRevealed = true;

        if (newBoard[row][col].neighborCount === 0) {
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              floodFill(row + i, col + j);
            }
          }
        }
      };
      
      floodFill(r, c);
      setBoard(newBoard);
      checkWin(newBoard);
    }
  };

  const toggleFlag = (e, r, c) => {
    e.preventDefault();
    if (gameState !== 'playing' || board[r][c].isRevealed) return;

    const newBoard = [...board];
    newBoard[r][c] = { ...newBoard[r][c], isFlagged: !newBoard[r][c].isFlagged };
    
    setBoard(newBoard);
    setFlagsLeft(prev => newBoard[r][c].isFlagged ? prev - 1 : prev + 1);
  };

  const checkWin = (currentBoard) => {
    const totalMines = Math.min(leftMines + rightMines, gridSize * gridSize - 1);
    let revealedCount = 0;
    currentBoard.forEach(row => {
      row.forEach(cell => {
        if (cell.isRevealed) revealedCount++;
      });
    });

    if (revealedCount === gridSize * gridSize - totalMines) {
      setGameState('won');
    }
  };

  const getCellColor = (count) => {
    const colors = [
      'transparent', '#2196F3', '#4CAF50', '#FF5252', '#9C27B0', '#FF9800', '#009688', '#795548', '#607D8B'
    ];
    return colors[count] || '#000';
  };

  const controlsLocked = gameState === 'lost' && !pendingRestart;

  if (gameState === 'setup') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          width: '100%',
          height: '100%',
          padding: '20px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '40px',
          borderRadius: '30px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
          maxWidth: '500px',
          width: '90%'
        }}>
          <h2 style={{ margin: 0, textAlign: 'center', color: '#333', fontSize: '1.8rem' }}>游戏设置</h2>
          
          {/* Grid Size Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontWeight: 'bold', color: '#555' }}>棋盘大小: {gridSize} x {gridSize}</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[10, 11, 12, 13, 14, 15].map(size => (
                <button
                  key={size}
                  onClick={() => setGridSize(size)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: gridSize === size ? '#2196F3' : '#f0f2f5',
                    color: gridSize === size ? 'white' : '#666',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                >
                  {size}x{size}
                </button>
              ))}
            </div>
          </div>

          {/* Mine Count Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Left User Mines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <label style={{ fontWeight: 'bold', color: '#555' }}>{leftName} 的地雷数</label>
                 <span style={{ color: '#2196F3', fontWeight: 'bold' }}>{leftMines}</span>
               </div>
               <input 
                 type="range" 
                 min="1" 
                 max="30" 
                 value={leftMines} 
                 onChange={(e) => setLeftMines(parseInt(e.target.value))}
                 style={{ width: '100%', accentColor: '#2196F3' }}
               />
            </div>

            {/* Right User Mines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <label style={{ fontWeight: 'bold', color: '#555' }}>{rightName} 的地雷数</label>
                 <span style={{ color: '#FF5252', fontWeight: 'bold' }}>{rightMines}</span>
               </div>
               <input 
                 type="range" 
                 min="1" 
                 max="30" 
                 value={rightMines} 
                 onChange={(e) => setRightMines(parseInt(e.target.value))}
                 style={{ width: '100%', accentColor: '#FF5252' }}
               />
            </div>

            <div style={{ 
              textAlign: 'center', 
              fontSize: '0.9rem', 
              color: '#888',
              background: '#f8f9fa',
              padding: '10px',
              borderRadius: '10px'
            }}>
              总地雷数: <span style={{ fontWeight: 'bold', color: '#333' }}>{leftMines + rightMines}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={initGame}
              style={{
                padding: '15px 40px',
                borderRadius: '20px',
                border: 'none',
                background: '#4CAF50',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 8px 20px rgba(76, 175, 80, 0.3)'
              }}
            >
              <Play size={20} fill="currentColor" /> 开始扫雷
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEndGame}
              style={{
                padding: '15px 40px',
                borderRadius: '20px',
                border: 'none',
                background: '#FF5252',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 8px 20px rgba(255, 82, 82, 0.3)'
              }}
            >
              <LogOut size={20} /> 返回
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        width: '100%',
        height: '100%',
        maxWidth: '100vw',
        maxHeight: '100vh',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header Info */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        width: '100%', 
        maxWidth: '500px',
        alignItems: 'center', 
        marginBottom: '10px',
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        padding: '10px 20px',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#333', fontWeight: 'bold' }}>
           <Flag size={24} color="#FF5252" fill="#FF5252" />
           <span>{flagsLeft}</span>
        </div>
        
        {gameState !== 'playing' ? (
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: gameState === 'won' ? '#4CAF50' : '#FF5252', textShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
          >
            {gameState === 'won' ? '扫雷成功!' : '游戏结束!'}
          </motion.div>
        ) : (
          <div style={{ fontSize: '1.2rem', color: '#444' }}>
             {Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
           <Bomb size={24} color="#333" />
           <span style={{ color: '#333', fontWeight: 'bold' }}>{leftMines + rightMines}</span>
        </div>
      </div>

      {/* Board */}
      <div style={{
        position: 'relative',
        width: 'min(90vw, calc(100vh - 200px), 500px)',
        aspectRatio: '1',
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '10px',
        padding: '10px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        gap: '2px',
        userSelect: 'none'
      }}>
        {board.map((row, rIndex) => (
          row.map((cell, cIndex) => (
            <motion.div
              key={`${rIndex}-${cIndex}`}
              onClick={() => revealCell(rIndex, cIndex)}
              onContextMenu={(e) => toggleFlag(e, rIndex, cIndex)}
              whileHover={!cell.isRevealed && gameState === 'playing' ? { scale: 1.05, zIndex: 10 } : {}}
              whileTap={!cell.isRevealed && gameState === 'playing' ? { scale: 0.95 } : {}}
              style={{
                background: cell.isRevealed 
                  ? (cell.isMine ? '#FF5252' : '#E0E0E0') 
                  : '#B0C4DE',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: gridSize > 12 ? '1rem' : '1.2rem',
                fontWeight: 'bold',
                cursor: !cell.isRevealed && gameState === 'playing' ? 'pointer' : 'default',
                color: cell.isRevealed && !cell.isMine ? getCellColor(cell.neighborCount) : '#fff',
                boxShadow: !cell.isRevealed ? 'inset 2px 2px 5px rgba(255,255,255,0.5), inset -2px -2px 5px rgba(0,0,0,0.1)' : 'none',
                transition: 'background 0.2s'
              }}
            >
              {cell.isRevealed ? (
                cell.isMine ? <Bomb size={gridSize > 12 ? 16 : 20} color="#fff" /> : (cell.neighborCount > 0 ? cell.neighborCount : '')
              ) : (
                cell.isFlagged ? <Flag size={gridSize > 12 ? 16 : 20} color="#FF5252" fill="#FF5252" /> : ''
              )}
            </motion.div>
          ))
        ))}
      </div>

      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginTop: '10px',
        width: '100%',
        maxWidth: '500px',
        justifyContent: 'center'
      }}>
         <motion.button
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={() => { if (!controlsLocked) setGameState('setup'); }}
           style={{
             padding: '12px 30px',
             borderRadius: '15px',
             border: 'none',
             background: controlsLocked ? 'rgba(33,150,243,0.5)' : '#2196F3',
             color: 'white',
             fontSize: '1rem',
             fontWeight: 'bold',
             cursor: controlsLocked ? 'not-allowed' : 'pointer',
             display: 'flex',
             alignItems: 'center',
             gap: '8px',
             boxShadow: '0 5px 15px rgba(33, 150, 243, 0.3)'
           }}
         >
           <RotateCcw size={20} /> 重新设置
         </motion.button>

         <motion.button
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={() => { if (!controlsLocked) onEndGame(); }}
           style={{
             padding: '12px 30px',
             borderRadius: '15px',
             border: 'none',
             background: controlsLocked ? 'rgba(255,82,82,0.5)' : '#FF5252',
             color: 'white',
             fontSize: '1rem',
             fontWeight: 'bold',
             cursor: controlsLocked ? 'not-allowed' : 'pointer',
             display: 'flex',
             alignItems: 'center',
             gap: '8px',
             boxShadow: '0 5px 15px rgba(255, 82, 82, 0.3)'
           }}
         >
           <LogOut size={20} /> 退出游戏
         </motion.button>
      </div>
    </motion.div>
  );
};


// Snake Game Component
const SnakeGame = ({ onEndGame, onRequirePunishment }) => {
  const [gridSize, setGridSize] = useState(20);
  const [fruitCount, setFruitCount] = useState(1);
  const [snakeA, setSnakeA] = useState([{ x: 2, y: 2 }]); // Left player (WSAD)
  const [snakeB, setSnakeB] = useState([{ x: 17, y: 17 }]); // Right player (Arrows)
  const [directionA, setDirectionA] = useState({ x: 1, y: 0 }); // Moving right
  const [directionB, setDirectionB] = useState({ x: -1, y: 0 }); // Moving left
  const [fruits, setFruits] = useState([]);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [gameState, setGameState] = useState('setup'); // 'setup', 'playing', 'won', 'lost'
  const [winner, setWinner] = useState(null);
  
  // Use refs for game loop to avoid dependency/closure issues
  const snakeARef = useRef(snakeA);
  const snakeBRef = useRef(snakeB);
  const directionARef = useRef(directionA);
  const directionBRef = useRef(directionB);
  const fruitsRef = useRef(fruits);
  const scoreARef = useRef(scoreA);
  const scoreBRef = useRef(scoreB);
  const gameStateRef = useRef(gameState);

  // Sync refs with state
  useEffect(() => { snakeARef.current = snakeA; }, [snakeA]);
  useEffect(() => { snakeBRef.current = snakeB; }, [snakeB]);
  useEffect(() => { directionARef.current = directionA; }, [directionA]);
  useEffect(() => { directionBRef.current = directionB; }, [directionB]);
  useEffect(() => { fruitsRef.current = fruits; }, [fruits]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // User names from localStorage
  const leftName = localStorage.getItem('couple_left_name') || 'LkbHua';
  const rightName = localStorage.getItem('couple_right_name') || 'ZengQ';

  // Handle Keyboard Input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;

      const currentDirA = directionARef.current;
      const currentDirB = directionBRef.current;

      // Snake A (WSAD)
      switch (e.key.toLowerCase()) {
        case 'w': if (currentDirA.y !== 1) setDirectionA({ x: 0, y: -1 }); break;
        case 's': if (currentDirA.y !== -1) setDirectionA({ x: 0, y: 1 }); break;
        case 'a': if (currentDirA.x !== 1) setDirectionA({ x: -1, y: 0 }); break;
        case 'd': if (currentDirA.x !== -1) setDirectionA({ x: 1, y: 0 }); break;
      }

      // Snake B (Arrows)
      switch (e.key) {
        case 'ArrowUp': if (currentDirB.y !== 1) setDirectionB({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (currentDirB.y !== -1) setDirectionB({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (currentDirB.x !== 1) setDirectionB({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (currentDirB.x !== -1) setDirectionB({ x: 1, y: 0 }); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const tick = setInterval(() => {
       updateGameStep();
    }, 150);

    return () => clearInterval(tick);
  }, [gameState]); // Only restart loop if game state changes (e.g. pause/resume)

  const updateGameStep = () => {
    // Read current state from refs
    const currentSnakeA = snakeARef.current;
    const currentSnakeB = snakeBRef.current;
    const currentDirA = directionARef.current;
    const currentDirB = directionBRef.current;
    const currentFruits = [...fruitsRef.current];

    // Calculate new heads
    const headA = { x: currentSnakeA[0].x + currentDirA.x, y: currentSnakeA[0].y + currentDirA.y };
    const headB = { x: currentSnakeB[0].x + currentDirB.x, y: currentSnakeB[0].y + currentDirB.y };

    // 1. Check Walls
    if (headA.x < 0 || headA.x >= gridSize || headA.y < 0 || headA.y >= gridSize) {
       handleGameOver('left'); return;
    }
    if (headB.x < 0 || headB.x >= gridSize || headB.y < 0 || headB.y >= gridSize) {
       handleGameOver('right'); return;
    }

    // 2. Check Collisions
    // A hits itself or B
    if (currentSnakeA.some(s => s.x === headA.x && s.y === headA.y) || currentSnakeB.some(s => s.x === headA.x && s.y === headA.y)) {
       handleGameOver('left'); return;
    }
    // B hits itself or A
    if (currentSnakeB.some(s => s.x === headB.x && s.y === headB.y) || currentSnakeA.some(s => s.x === headB.x && s.y === headB.y)) {
       handleGameOver('right'); return;
    }
    // Head to Head
    if (headA.x === headB.x && headA.y === headB.y) {
       setGameState('lost'); setWinner('draw'); return;
    }

    // 3. Fruits
    let growA = false;
    let growB = false;

    const fIndexA = currentFruits.findIndex(f => f.x === headA.x && f.y === headA.y);
    if (fIndexA !== -1) {
       growA = true;
       currentFruits.splice(fIndexA, 1);
       setScoreA(s => {
         const n = s + 1;
         if (n >= 99) handleWin('left');
         return n;
       });
    }

    // Note: If both eat same fruit (impossible if head collision checked first, but theoretically if fruit is at collision point)
    // The head collision check above handles it (draw).
    // But let's check B against remaining fruits
    const fIndexB = currentFruits.findIndex(f => f.x === headB.x && f.y === headB.y);
    if (fIndexB !== -1) {
       growB = true;
       currentFruits.splice(fIndexB, 1);
       setScoreB(s => {
         const n = s + 1;
         if (n >= 99) handleWin('right');
         return n;
       });
    }

    // Spawn
    if (currentFruits.length < fruitCount) {
       // Random frequency: 30% chance per tick + bonus for low count
       if (Math.random() < 0.3) {
          let x, y;
          let attempts = 0;
          do {
            x = Math.floor(Math.random() * gridSize);
            y = Math.floor(Math.random() * gridSize);
            attempts++;
          } while (
             attempts < 50 && (
             [headA, ...currentSnakeA].some(s => s.x === x && s.y === y) ||
             [headB, ...currentSnakeB].some(s => s.x === x && s.y === y) ||
             currentFruits.some(f => f.x === x && f.y === y))
          );
          if (attempts < 50) currentFruits.push({ x, y });
       }
    }

    // Batch updates
    setFruits(currentFruits);
    setSnakeA([headA, ...(growA ? currentSnakeA : currentSnakeA.slice(0, -1))]);
    setSnakeB([headB, ...(growB ? currentSnakeB : currentSnakeB.slice(0, -1))]);
  };
  
  // Re-implementing game loop cleanly with a single state or ref based approach would be better,
  // but let's stick to a simpler interval that updates refs or calls setters sequentially.
  
  // Clean Interval Approach
  useEffect(() => {
    if (gameState !== 'playing') return;
    const tick = setInterval(() => {
       step();
    }, 150);
    return () => clearInterval(tick);
  }, [gameState, directionA, directionB, fruits, snakeA, snakeB]); // Dependencies might cause re-renders/jitters if not careful.

  const step = () => {
    // We need current state. Using functional updates for atomic consistency.
    // However, A depends on B for collision.
    // Let's cheat slightly and use the state values directly since the interval is fast enough?
    // No, that's stale closures.
    // Let's use a single state object for game world if possible, or refs.
    // Given the constraints, let's just do best effort with refs for positions to check collisions.
    
    // Actually, let's just do the update logic inside setSnakeA and setSnakeB isn't atomic.
    // Let's use a single setGameWorld state? No, too much refactor.
    
    // Simplified Logic:
    // We will calculate next positions based on current state variables (snakeA, snakeB)
    // This requires the effect to have [snakeA, snakeB] dependency, which resets interval every tick.
    // This is a common pattern in React hooks for games (using useInterval custom hook).
    // Let's just use the dependency array approach.
    
    const headA = { x: snakeA[0].x + directionA.x, y: snakeA[0].y + directionA.y };
    const headB = { x: snakeB[0].x + directionB.x, y: snakeB[0].y + directionB.y };

    // 1. Check Walls
    if (headA.x < 0 || headA.x >= gridSize || headA.y < 0 || headA.y >= gridSize) {
       handleGameOver('left'); return;
    }
    if (headB.x < 0 || headB.x >= gridSize || headB.y < 0 || headB.y >= gridSize) {
       handleGameOver('right'); return;
    }

    // 2. Check Collisions
    // A hits itself or B
    if (snakeA.some(s => s.x === headA.x && s.y === headA.y) || snakeB.some(s => s.x === headA.x && s.y === headA.y)) {
       handleGameOver('left'); return;
    }
    // B hits itself or A
    if (snakeB.some(s => s.x === headB.x && s.y === headB.y) || snakeA.some(s => s.x === headB.x && s.y === headB.y)) {
       handleGameOver('right'); return;
    }
    // Head to Head
    if (headA.x === headB.x && headA.y === headB.y) {
       setGameState('lost'); setWinner('draw'); return;
    }

    // 3. Fruits
    let newFruits = [...fruits];
    let growA = false;
    let growB = false;

    const fIndexA = newFruits.findIndex(f => f.x === headA.x && f.y === headA.y);
    if (fIndexA !== -1) {
       growA = true;
       newFruits.splice(fIndexA, 1);
       setScoreA(s => {
         const n = s + 1;
         if (n >= 99) handleWin('left');
         return n;
       });
    }

    const fIndexB = newFruits.findIndex(f => f.x === headB.x && f.y === headB.y);
    if (fIndexB !== -1) {
       growB = true;
       newFruits.splice(fIndexB, 1);
       setScoreB(s => {
         const n = s + 1;
         if (n >= 99) handleWin('right');
         return n;
       });
    }

    // Spawn
    if (newFruits.length < fruitCount) {
       // Random frequency: 30% chance per tick + bonus for low count
       if (Math.random() < 0.3) {
          let x, y;
          let attempts = 0;
          do {
            x = Math.floor(Math.random() * gridSize);
            y = Math.floor(Math.random() * gridSize);
            attempts++;
          } while (
             attempts < 50 && (
             [headA, ...snakeA].some(s => s.x === x && s.y === y) ||
             [headB, ...snakeB].some(s => s.x === x && s.y === y) ||
             newFruits.some(f => f.x === x && f.y === y))
          );
          if (attempts < 50) newFruits.push({ x, y });
       }
    }

    setFruits(newFruits);
    setSnakeA([headA, ...(growA ? snakeA : snakeA.slice(0, -1))]);
    setSnakeB([headB, ...(growB ? snakeB : snakeB.slice(0, -1))]);
  };

  const handleGameOver = (loser) => {
    setGameState('lost');
    setWinner(loser === 'left' ? 'right' : 'left');
    // Trigger punishment
    if (onRequirePunishment) {
      onRequirePunishment(loser, () => {
         // Callback after punishment
         // Unlock controls or allow reset
      });
    }
  };

  const handleWin = (winnerSide) => {
     setGameState('won');
     setWinner(winnerSide);
     if (onRequirePunishment) {
        onRequirePunishment(winnerSide === 'left' ? 'right' : 'left', () => {});
     }
  };

  const initGame = () => {
    setSnakeA([{ x: 2, y: Math.floor(gridSize/2) }]);
    setSnakeB([{ x: gridSize-3, y: Math.floor(gridSize/2) }]);
    setDirectionA({ x: 1, y: 0 });
    setDirectionB({ x: -1, y: 0 });
    setScoreA(0);
    setScoreB(0);
    setFruits([]);
    setGameState('playing');
    setWinner(null);
  };

  if (gameState === 'setup') {
     return (
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '40px',
          borderRadius: '30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          alignItems: 'center',
          width: 'min(500px, 90%)'
        }}>
          <h2 style={{ margin: 0, color: '#FF7F50' }}>贪吃蛇大作战</h2>
          
          <div style={{ width: '100%' }}>
             <label style={{ fontWeight: 'bold', color: '#555' }}>棋盘大小: {gridSize}x{gridSize}</label>
             <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'center' }}>
               {[15, 20, 25, 30].map(s => (
                 <button key={s} onClick={() => setGridSize(s)}
                   style={{
                     padding: '8px 16px',
                     borderRadius: '10px',
                     border: 'none',
                     background: gridSize === s ? '#FF7F50' : '#eee',
                     color: gridSize === s ? 'white' : '#555',
                     cursor: 'pointer'
                   }}
                 >{s}x{s}</button>
               ))}
             </div>
          </div>

          <div style={{ width: '100%' }}>
             <label style={{ fontWeight: 'bold', color: '#555' }}>果实数量: {fruitCount}</label>
             <input type="range" min="1" max="10" value={fruitCount} onChange={e => setFruitCount(parseInt(e.target.value))} 
               style={{ width: '100%', accentColor: '#FF7F50', marginTop: '10px' }} />
          </div>

          <div style={{
             background: '#fff3e0',
             padding: '15px',
             borderRadius: '10px',
             fontSize: '0.9rem',
             color: '#e65100',
             lineHeight: '1.5'
          }}>
             <div>🎮 {leftName}: WSAD 控制</div>
             <div>🎮 {rightName}: ↑↓←→ 控制</div>
             <div>🏆 率先吃到99个果实或迫使对方撞击获胜</div>
          </div>

          <button onClick={initGame} style={{
             padding: '12px 40px',
             borderRadius: '20px',
             border: 'none',
             background: '#FF7F50',
             color: 'white',
             fontSize: '1.2rem',
             fontWeight: 'bold',
             cursor: 'pointer',
             boxShadow: '0 4px 15px rgba(255, 127, 80, 0.4)'
          }}>开始对战</button>
          
          <button onClick={onEndGame} style={{
             padding: '12px 40px',
             borderRadius: '20px',
             border: 'none',
             background: '#f44336',
             color: 'white',
             fontSize: '1rem',
             fontWeight: 'bold',
             cursor: 'pointer'
          }}>退出</button>
        </div>
     );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
       {/* Score Board */}
       <div style={{ display: 'flex', gap: '40px', background: 'rgba(255,255,255,0.9)', padding: '10px 30px', borderRadius: '20px' }}>
          <div style={{ color: '#2196F3', fontWeight: 'bold', fontSize: '1.2rem' }}>{leftName}: {scoreA}</div>
          <div style={{ color: '#FF5252', fontWeight: 'bold', fontSize: '1.2rem' }}>{rightName}: {scoreB}</div>
       </div>

       {/* Game Grid */}
       <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          width: 'min(80vw, 600px)',
          aspectRatio: '1',
          background: '#2d3436',
          borderRadius: '10px',
          border: '4px solid #636e72',
          position: 'relative'
       }}>
          {/* Render Snake A */}
          {snakeA.map((seg, i) => (
             <div key={`a-${i}`} style={{
                gridColumn: seg.x + 1,
                gridRow: seg.y + 1,
                background: i === 0 ? '#64B5F6' : '#2196F3',
                borderRadius: i === 0 ? '50%' : '2px',
                zIndex: 2
             }} />
          ))}

          {/* Render Snake B */}
          {snakeB.map((seg, i) => (
             <div key={`b-${i}`} style={{
                gridColumn: seg.x + 1,
                gridRow: seg.y + 1,
                background: i === 0 ? '#FF8A80' : '#FF5252',
                borderRadius: i === 0 ? '50%' : '2px',
                zIndex: 2
             }} />
          ))}

          {/* Render Fruits */}
          {fruits.map((f, i) => (
             <div key={`f-${i}`} style={{
                gridColumn: f.x + 1,
                gridRow: f.y + 1,
                background: '#00E676',
                borderRadius: '50%',
                boxShadow: '0 0 10px #00E676',
                transform: 'scale(0.8)',
                zIndex: 1
             }} />
          ))}
       </div>

       {/* Controls */}
       <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => setGameState('setup')} style={{
             padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#2196F3', color: 'white', fontWeight: 'bold', cursor: 'pointer'
          }}>重新设置</button>
          <button onClick={onEndGame} style={{
             padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#f44336', color: 'white', fontWeight: 'bold', cursor: 'pointer'
          }}>退出游戏</button>
       </div>
    </div>
  );
};

const FlyingChessGame = ({ onEndGame, onBackToMode, mode = '基础版' }) => {
  const [playerPositions, setPlayerPositions] = useState({ left: 0, right: 0 });
  const [currentPlayer, setCurrentPlayer] = useState('left'); // 'left' or 'right'
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'won'
  const [winner, setWinner] = useState(null);
  const [gameLog, setGameLog] = useState('点击骰子开始游戏！');
  
  // Modal for task display
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeTask, setActiveTask] = useState('');
  const resolveTaskRef = React.useRef(null);

  // User names from localStorage
  const leftName = localStorage.getItem('couple_left_name') || 'LkbHua';
  const rightName = localStorage.getItem('couple_right_name') || 'ZengQ';
  const leftAvatar = localStorage.getItem('couple_left_avatar');
  const rightAvatar = localStorage.getItem('couple_right_avatar');

  // Heating Up Mode Configuration
  const isHeatingUp = mode === '升温版';
  const isIntimate = mode === '亲密版';
  
  const HEATING_UP_LIST = [
    "起点", "下一轮游戏十指相扣", "拍三张情侣照", "向对方撒娇", "掌心猜字", "后退两步", "一分钟不允许身体接触", "再来一次",
    "弹脑门三下", "对对对挑战", "前进两步", "发一条朋友圈(对方指定)", "蒙眼亲亲", "给对方录一个起床铃", "接受随机惩罚", "蒙眼猜东西",
    "回到原点", "接受随机惩罚", "前进四步", "拥抱三十秒", "模仿一个表情包", "接受随机惩罚", "壁咚对方10秒", "说出最喜欢的称呼",
    "前进一步", "脸手耳朵三脸亲", "分享一首歌", "对视三十秒", "后退一步", "接受随机惩罚", "用对方手机自拍一张", "说出今天心动的时刻",
    "接受随机惩罚", "什么都不做", "指定亲亲的部位", "接受随机惩罚", "可爱三连拍", "做对方腿上摇摇车", "前进一步", "词语接龙",
    "尝试三种不同的拥抱姿势", "再来一次", "贴贴20s", "蒙眼猜食物", "接受随机惩罚", "描述对方的味道", "前进两步", "模仿一种动物的叫声",
    "贴额头十秒", "给对方喂食物", "接受随机惩罚", "公主抱", "前进两步", "被对方捏脸", "一起吃一口食物", "说出三个词形容对方",
    "接受随机惩罚", "说出此刻最想做的事情是什么", "后退十步", "接受随机惩罚", "要求对方完成事情",
    "深情对视一分钟", "为对方按摩五分钟", "终点"
  ];

  const INTIMATE_MODE_LIST = [
    "起点", "深情对视10秒", "牵手一分钟", "摸摸头", "夸对方三个优点", "前进一步", "做个鬼脸", "后退一步",
    "亲脸颊一下", "说我爱你", "拥抱20秒", "前进两步", "分享一个秘密", "唱两句情歌", "按摩肩膀", "后退两步",
    "鼻尖碰鼻尖", "十指相扣", "喂对方吃东西", "壁咚", "前进一步", "亲手背", "学猫叫", "后退一步",
    "公主抱5秒", "深情告白", "亲额头", "前进三步", "拍合照", "说土味情话", "挠痒痒", "后退三步",
    "亲嘴唇", "咬耳朵(轻轻)", "种草莓(假装)", "前进两步", "坐大腿", "背后抱", "摸腹肌/软肉", "后退两步",
    "法式热吻", "脱一件衣服(外套)", "亲脖子", "前进四步", "用嘴喂食", "全身摸索(轻轻)", "说出对方敏感点", "后退四步",
    "为对方穿袜子", "合唱一首歌", "模仿对方说话", "互相喂水", "深蹲5个", "俯卧撑3个", "亲手心", "摸摸耳朵",
    "对视不许笑", "夸对方性感", "说出对方三个缺点(开玩笑)", "承诺一件事", "大声喊我爱你", "任意惩罚", "满足一个愿望", "终点"
  ];

  // Board Configuration
  const CURRENT_LIST = isIntimate ? INTIMATE_MODE_LIST : (isHeatingUp ? HEATING_UP_LIST : []);
  const TOTAL_STEPS = (isHeatingUp || isIntimate) ? CURRENT_LIST.length - 1 : 40;
  
  // Special tiles for Basic Mode
  const SPECIAL_TILES = {
    5: { type: 'fly', value: 4, label: '顺风', color: '#4CAF50', icon: ArrowUp },
    12: { type: 'crash', value: -3, label: '撞鸟', color: '#FF5252', icon: AlertTriangle },
    18: { type: 'fly', value: 6, label: '喷射', color: '#2196F3', icon: Zap },
    25: { type: 'crash', value: -5, label: '故障', color: '#FF9800', icon: ArrowDown },
    32: { type: 'fly', value: 5, label: '冲刺', color: '#9C27B0', icon: Plane },
  };

  const rollDice = async () => {
    if (gameState !== 'playing' || isRolling) return;

    setIsRolling(true);
    setGameLog(`${currentPlayer === 'left' ? leftName : rightName} 正在掷骰子...`);

    // Animation loop
    let rollCount = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount > 10) {
        clearInterval(interval);
        finishRoll();
      }
    }, 100);
  };

  const finishRoll = () => {
    const finalValue = Math.floor(Math.random() * 6) + 1;
    setDiceValue(finalValue);
    setIsRolling(false);
    
    movePlayer(finalValue);
  };

  const movePlayer = async (steps) => {
    let currentPos = playerPositions[currentPlayer];
    let finalPos = currentPos + steps;
    let logMsg = `${currentPlayer === 'left' ? leftName : rightName} 掷出了 ${steps} 点，前进！`;
    let nextTurn = true;

    // Cap at total steps
    if (finalPos > TOTAL_STEPS) finalPos = TOTAL_STEPS;

    setGameLog(logMsg);

    // Step-by-step animation
    if (finalPos > currentPos) {
      for (let i = currentPos + 1; i <= finalPos; i++) {
        setPlayerPositions(prev => ({ ...prev, [currentPlayer]: i }));
        // Short delay for "silky smooth" bounce effect
        await new Promise(r => setTimeout(r, 450));
      }
    } else if (finalPos < currentPos) {
       // Handle backward movement if needed (though dice is usually forward)
       setPlayerPositions(prev => ({ ...prev, [currentPlayer]: finalPos }));
    }

    let newPos = finalPos;

    // Initial check for win
    if (newPos >= TOTAL_STEPS) {
      setGameState('won');
      setWinner(currentPlayer);
      setGameLog(`${currentPlayer === 'left' ? leftName : rightName} 到达终点，获胜！`);
      return;
    }

    // Show Task Modal if Heating Up or Intimate
    if ((isHeatingUp || isIntimate) && newPos > 0 && newPos < TOTAL_STEPS) {
      const text = CURRENT_LIST[newPos];
      // Only show modal for non-movement tasks or if we want to show everything
      // The user said "show content expanded and indicate requirement".
      // Let's show it for all valid tiles.
      setActiveTask(text);
      setShowTaskModal(true);
      
      // Wait for user to acknowledge
      await new Promise(resolve => {
        resolveTaskRef.current = resolve;
      });
    }

    // Handle Special Effects
    if (isHeatingUp || isIntimate) {
      const text = CURRENT_LIST[newPos];
      let effectMove = 0;
      
      if (text.includes('前进')) {
        if (text.includes('两')) effectMove = 2;
        else if (text.includes('四')) effectMove = 4;
        else if (text.includes('三')) effectMove = 3;
        else if (text.includes('一')) effectMove = 1;
      } else if (text.includes('后退')) {
        if (text.includes('两')) effectMove = -2;
        else if (text.includes('一')) effectMove = -1;
        else if (text.includes('三')) effectMove = -3;
        else if (text.includes('四')) effectMove = -4;
        else if (text.includes('十')) effectMove = -10;
      } else if (text.includes('回到原点')) {
        newPos = 0;
        setGameLog(`回到原点！太惨了！`);
        setPlayerPositions(prev => ({ ...prev, [currentPlayer]: newPos }));
      } else if (text.includes('再来一次')) {
        nextTurn = false;
        setGameLog(`再来一次！运气爆棚！`);
      }

      if (effectMove !== 0) {
        const targetEffectPos = newPos + effectMove;
        // Animation for effect movement
        if (targetEffectPos > newPos) {
             for (let i = newPos + 1; i <= targetEffectPos && i <= TOTAL_STEPS; i++) {
                setPlayerPositions(prev => ({ ...prev, [currentPlayer]: i }));
                await new Promise(r => setTimeout(r, 450));
             }
             newPos = targetEffectPos > TOTAL_STEPS ? TOTAL_STEPS : targetEffectPos;
        } else {
             newPos = targetEffectPos < 0 ? 0 : targetEffectPos;
             setPlayerPositions(prev => ({ ...prev, [currentPlayer]: newPos }));
        }
        
        setGameLog(`${text}！${effectMove > 0 ? '前进' : '后退'} ${Math.abs(effectMove)} 步`);
        await new Promise(r => setTimeout(r, 600));
      }
    } else {
      // Basic Mode Special Tiles
      if (SPECIAL_TILES[newPos]) {
        const effect = SPECIAL_TILES[newPos];
        const targetEffectPos = newPos + effect.value;
        
        // Simple jump for basic mode
        newPos = targetEffectPos;
        if (newPos < 0) newPos = 0;
        if (newPos >= TOTAL_STEPS) newPos = TOTAL_STEPS;
        
        setPlayerPositions(prev => ({ ...prev, [currentPlayer]: newPos }));
        setGameLog(`${effect.label}！${effect.value > 0 ? '前进' : '后退'} ${Math.abs(effect.value)} 步`);
        await new Promise(r => setTimeout(r, 600));
      }
    }

    // Check win again after effects
    if (newPos >= TOTAL_STEPS) {
       setGameState('won');
       setWinner(currentPlayer);
       setGameLog(`${currentPlayer === 'left' ? leftName : rightName} 到达终点，获胜！`);
       return;
    }

    // Check collision (Kick)
    const opponent = currentPlayer === 'left' ? 'right' : 'left';
    if (newPos === playerPositions[opponent] && newPos !== 0 && newPos !== TOTAL_STEPS) {
      setPlayerPositions(prev => ({ ...prev, [opponent]: 0 }));
      setGameLog(`撞飞了对手！${currentPlayer === 'left' ? rightName : leftName} 回到起点！`);
    }

    // Switch turn
    if (nextTurn) {
      setCurrentPlayer(prev => prev === 'left' ? 'right' : 'left');
    }
  };

  const HEATING_UP_COLORS = [
    '#FFCDD2', // 淡红色
    '#FFE0B2', // 淡橙色
    '#FFF9C4', // 淡黄色
    '#B2EBF2', // 淡青色
    '#BBDEFB', // 淡蓝色
    '#D7CCC8'  // 淡褐色
  ];

  const renderIntimateBoard = () => {
    // Heart Parametric Equation:
    // x = 16sin^3(t)
    // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
    // Scale factors to fit in 100% box
    
    const getHeartPos = (t, scale) => {
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)); 
      // y is inverted because screen coords go down
      
      // Center (50%, 50%)
      // Max x is approx +/- 16. Max y is approx +13/-17. Total height ~30. Total width ~32.
      // We map this to percentage.
      // Adjusted for wider aspect ratio (1.5)
      const kx = 2.3 * scale; 
      const ky = 1.9 * scale;
      
      return {
        left: 50 + x * kx,
        top: 42 + y * ky // Move slightly up as heart is bottom-heavy
      };
    };

    const TOTAL = INTIMATE_MODE_LIST.length; // 64
    // 3 concentric layers to fit 64 items less densely
    // Layer 1 (Outer): 32 items
    // Layer 2 (Middle): 20 items
    // Layer 3 (Inner): 11 items
    // Center: 1 item (End)
    const layer1Count = 32;
    const layer2Count = 20;
    const layer3Count = 11;
    
    const calculatedPositions = [];

    for (let i = 0; i < TOTAL; i++) {
      let pos = { left: 50, top: 50 };
      
      if (i === TOTAL - 1) {
        // Center (End)
        pos = { left: 50, top: 50 };
      } else if (i < layer1Count) {
        // Layer 1 (Outer)
        // t goes from -PI to PI
        const t = -Math.PI + (i / layer1Count) * 2 * Math.PI;
        pos = getHeartPos(t, 1.3); // Increased scale for more space
      } else if (i < layer1Count + layer2Count) {
        // Layer 2 (Middle)
        const j = i - layer1Count;
        const t = -Math.PI + (j / layer2Count) * 2 * Math.PI;
        pos = getHeartPos(t, 0.9); // Increased scale
      } else {
        // Layer 3 (Inner)
        const k = i - (layer1Count + layer2Count);
        const t = -Math.PI + (k / layer3Count) * 2 * Math.PI;
        pos = getHeartPos(t, 0.5); // Slightly increased
      }
      calculatedPositions.push(pos);
    }

    // Generate SVG Path Data
    const pathData = calculatedPositions.map((pos, i) => {
      return `${i === 0 ? 'M' : 'L'} ${pos.left} ${pos.top}`;
    }).join(' ');

    const tiles = [];
    
    for (let i = 0; i < TOTAL; i++) {
      const pos = calculatedPositions[i];
      const content = INTIMATE_MODE_LIST[i];
      const isPlayerHere = playerPositions.left === i || playerPositions.right === i;
      
      // Calculate Arrow
      let arrowRotation = null;
      if (i < TOTAL - 1) {
         const nextPos = calculatedPositions[i + 1];
         // Calculate angle from current to next
         const dx = nextPos.left - pos.left;
         const dy = nextPos.top - pos.top;
         
         const angle = Math.atan2(dy, dx) * (180 / Math.PI);
         arrowRotation = angle;
      }
      
      // Visual Style for Intimate Mode
      const shapeType = i % 4;
      const bgColor = i === 0 ? '#4CAF50' : (i === TOTAL - 1 ? '#E91E63' : HEATING_UP_COLORS[i % 6]);
      
      // Decorations
      const DECORATIONS = {
         8: '🐻', 
         16: '🐰',
         24: '🐶',
         32: '🐱',
         42: '🐼',
         52: '🐨',
         58: '🦊'
      };
      const decoration = DECORATIONS[i];

      tiles.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${pos.left}%`,
            top: `${pos.top}%`,
            width: '36px', // Further reduced size to avoid overlap
            height: '36px',
            transform: 'translate(-50%, -50%)',
            zIndex: isPlayerHere ? 20 : 10
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ 
              scale: isPlayerHere ? 1.2 : 1,
              filter: isPlayerHere ? 'brightness(1.1)' : 'brightness(1)',
              zIndex: isPlayerHere ? 30 : 1
            }}
            whileHover={{ scale: 1.1, zIndex: 30 }}
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {/* Shape Background */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: bgColor,
              borderRadius: shapeType === 0 ? '50%' : '4px', // Circle for type 0
              clipPath: 
                shapeType === 1 ? 'polygon(50% 0%, 100% 100%, 0% 100%)' : // Triangle
                shapeType === 2 ? 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' : // Trapezoid
                shapeType === 3 ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : // Rhombus
                undefined, // Circle (default)
              boxShadow: isPlayerHere 
                ? '0 0 15px 2px rgba(255, 105, 180, 0.8)' 
                : (shapeType === 0 ? '0 2px 5px rgba(0,0,0,0.2)' : 'none'),
              border: isPlayerHere ? '2px solid #fff' : 'none',
              filter: shapeType !== 0 ? 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' : 'none'
            }} />

            {/* Content */}
            <div style={{
              zIndex: 2,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              padding: '2px',
              paddingTop: shapeType === 1 ? '6px' : '0', // Adjust for Triangle
              color: (i === 0 || i === TOTAL - 1) ? '#fff' : '#5D4037',
              fontSize: '0.45rem', // Slightly smaller text
              fontWeight: 'bold',
              textAlign: 'center',
              lineHeight: '1.0',
              textShadow: (i === 0 || i === TOTAL - 1) ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
            }}>
               <span style={{ transform: 'scale(0.9)', maxWidth: '95%' }}>
                 {content}
               </span>
            </div>
            
            {/* Heart Icon Overlay (Optional, simplified) */}
            {(i !== 0 && i !== TOTAL - 1 && i % 5 === 0) && (
               <Heart 
                 fill="rgba(255,255,255,0.4)" 
                 color="transparent" 
                 size={18} 
                 style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} 
               />
             )}
          </motion.div>
          
          {/* Arrow Indicator */}
          {arrowRotation !== null && i < TOTAL - 1 && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '16px',
                height: '16px',
                transform: `translate(-50%, -50%) rotate(${arrowRotation}deg) translate(20px)`,
                pointerEvents: 'none',
                opacity: 0.8,
                zIndex: 5
              }}
            >
              <div style={{ 
                 color: 'rgba(255,255,255,0.9)', 
                 fontSize: '10px', 
                 fontWeight: 'bold',
                 textShadow: '0 0 2px rgba(0,0,0,0.5)' 
              }}>
                ➤
              </div>
            </div>
          )}
          
          {/* Animal Decorations */}
          {decoration && (
            <div style={{
              position: 'absolute',
              top: '-15px',
              right: '-15px',
              fontSize: '1.2rem',
              zIndex: 5,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              animation: 'float 3s ease-in-out infinite'
            }}>
              {decoration}
            </div>
          )}
          
          {/* Players */}
          <AnimatePresence>
            {playerPositions.left === i && (
               <motion.div
                 layoutId="player-left"
                 initial={{ scale: 0 }}
                 animate={{ scale: 1, y: -25 }}
                 exit={{ scale: 0 }}
                 style={{ position: 'absolute', width: '22px', height: '22px', zIndex: 30 }}
               >
                 {leftAvatar && <img src={leftAvatar} alt="" style={{width:'100%',height:'100%', borderRadius:'50%', border:'2px solid white'}}/>}
               </motion.div>
            )}
            {playerPositions.right === i && (
               <motion.div
                 layoutId="player-right"
                 initial={{ scale: 0 }}
                 animate={{ scale: 1, y: -25, x: 6 }}
                 exit={{ scale: 0 }}
                 style={{ position: 'absolute', width: '22px', height: '22px', zIndex: 31 }}
               >
                 {rightAvatar && <img src={rightAvatar} alt="" style={{width:'100%',height:'100%', borderRadius:'50%', border:'2px solid white'}}/>}
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      );

    }
    
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1200px', // Further increased width for wider layout
        aspectRatio: '1.4', // Wider aspect ratio (width > height)
        margin: '0 auto',
      }}>
         {/* Path Line Indicator */}
         <svg style={{ 
           position: 'absolute', 
           top: 0, 
           left: 0, 
           width: '100%', 
           height: '100%', 
           pointerEvents: 'none', 
           zIndex: 0 
         }} viewBox="0 0 100 100" preserveAspectRatio="none">
            <path 
              d={pathData} 
              fill="none" 
              stroke="rgba(255, 105, 180, 0.4)" 
              strokeWidth="0.3" 
              strokeDasharray="1,1" 
            />
         </svg>

         {tiles}
         {/* Decoration Center */}
         <div style={{
           position: 'absolute',
           left: '50%',
           top: '50%',
           transform: 'translate(-50%, -50%)',
           fontSize: '3rem',
           opacity: 0.3,
           pointerEvents: 'none'
         }}>
           💖
         </div>
      </div>
    );
  };

  const renderSpiralBoard = () => {
    // Generate 8x8 grid coordinates for spiral path
    const grid = Array(8).fill(null).map(() => Array(8).fill(null));
    // Also map index to coordinates for easy direction lookup
    const indexToCoord = {};
    
    // Spiral logic
    // Directions: 0:Right, 1:Down, 2:Left, 3:Up
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]; 
    let row = 0, col = 0, dir = 0;
    let top = 0, bottom = 7, left = 0, right = 7;
    
    for (let i = 0; i < 64; i++) {
      if (i >= HEATING_UP_LIST.length) break;
      
      grid[row][col] = i;
      indexToCoord[i] = { r: row, c: col };
      
      let nextRow = row + directions[dir][0];
      let nextCol = col + directions[dir][1];
      
      if (dir === 0 && nextCol > right) {
        dir = 1; top++; nextRow = row + 1; nextCol = col;
      } else if (dir === 1 && nextRow > bottom) {
        dir = 2; right--; nextRow = row; nextCol = col - 1;
      } else if (dir === 2 && nextCol < left) {
        dir = 3; bottom--; nextRow = row - 1; nextCol = col;
      } else if (dir === 3 && nextRow < top) {
        dir = 0; left++; nextRow = row; nextCol = col + 1;
      }
      
      row = nextRow;
      col = nextCol;
    }

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: '12px',
        width: '100%',
        padding: '10px'
      }}>
        {Array(8).fill(null).map((_, r) => (
          Array(8).fill(null).map((_, c) => {
            const index = grid[r][c];
            if (index === null) return <div key={`empty-${r}-${c}`} />;
            
            const text = HEATING_UP_LIST[index];
            const isStart = index === 0;
            const isEnd = index === HEATING_UP_LIST.length - 1;
            
            // Determine arrow direction
            let arrow = null;
            if (!isEnd) {
              const nextCoord = indexToCoord[index + 1];
              if (nextCoord) {
                if (nextCoord.c > c) arrow = '→'; // Right
                else if (nextCoord.r > r) arrow = '↓'; // Down
                else if (nextCoord.c < c) arrow = '←'; // Left
                else if (nextCoord.r < r) arrow = '↑'; // Up
              }
            }
            
            // Calculate background color based on step sequence
            // Start: Green, End: Pink
            // Steps 1-62: 6-color repeating pattern
            const isPlayerHere = playerPositions.left === index || playerPositions.right === index;

            let bgColor = 'rgba(255, 255, 255, 0.3)';
            if (isStart) bgColor = '#4CAF50';
            else if (isEnd) bgColor = '#FF7AB9';
            else {
              bgColor = HEATING_UP_COLORS[(index - 1) % 6];
            }

            // Shape and Decoration Logic
            // Shapes: 0: Rounded, 1: Triangle, 2: Trapezoid, 3: Rhombus
            const shapeType = index % 4;
            
            // Decoration at corners/turns
            let decoration = null;
            const key = `${r},${c}`;
            const DECORATIONS = {
              '0,7': '🐻', // Top Right - Bear
              '7,7': '🐰', // Bottom Right - Rabbit
              '7,0': '🐶', // Bottom Left - Dog
              '1,0': '🐱', // Inner Top Left - Cat
              '1,6': '🐼', // Inner Top Right - Panda
              '6,6': '🐨', // Inner Bottom Right - Koala
              '6,1': '🦊', // Inner Bottom Left - Fox
              '2,1': '🐯'  // Further inner - Tiger
            };
            if (DECORATIONS[key]) decoration = DECORATIONS[key];

            return (
              <div key={index} style={{ position: 'relative', width: '100%', aspectRatio: '1.6' }}>
                <motion.div
                  animate={isPlayerHere ? { 
                    scale: [1, 1.1, 1], 
                    y: [0, -6, 0],
                    filter: ['brightness(1)', 'brightness(1.1)', 'brightness(1)']
                  } : { 
                    scale: 1, 
                    y: 0,
                    filter: 'brightness(1)'
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {/* Shape Background */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: bgColor,
                    borderRadius: shapeType === 0 ? '16px' : '4px', // Rounded for type 0
                    clipPath: 
                      shapeType === 1 ? 'polygon(50% 0%, 100% 100%, 0% 100%)' : // Triangle
                      shapeType === 2 ? 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' : // Trapezoid
                      shapeType === 3 ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : // Rhombus
                      undefined, // Rounded (default)
                    boxShadow: shapeType === 0 ? '0 4px 8px rgba(0,0,0,0.1)' : 'none', // Shadow only works well on non-clipped
                    filter: shapeType !== 0 ? 'drop-shadow(0 4px 4px rgba(0,0,0,0.1))' : 'none', // Drop shadow for clipped shapes
                    zIndex: 0
                  }} />

                  {/* Content */}
                  <div style={{
                    zIndex: 1,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    padding: '4px',
                    color: isStart || isEnd ? '#fff' : '#5D4037', // Brownish text for softness
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    textShadow: '0 1px 2px rgba(255,255,255,0.5)'
                  }}>
                    <motion.div
                      layoutId={showTaskModal && isPlayerHere ? 'task-card' : undefined}
                      style={{
                        padding: '2px',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        // Adjust text position for Triangle
                        paddingTop: shapeType === 1 ? '16px' : '0' 
                      }}
                    >
                      {text}
                    </motion.div>
                  </div>

                  {/* Direction Arrow - Adjusted Position */}
                  {arrow && (
                    <div style={{
                      position: 'absolute',
                      zIndex: 2,
                      color: 'rgba(93, 64, 55, 0.4)', // Matching text tone
                      fontSize: '1.2rem',
                      pointerEvents: 'none',
                      ...(arrow === '→' ? { right: '-8px', top: '50%', transform: 'translateY(-50%)' } :
                        arrow === '↓' ? { bottom: '-10px', left: '50%', transform: 'translateX(-50%)' } :
                        arrow === '←' ? { left: '-8px', top: '50%', transform: 'translateY(-50%)' } :
                        arrow === '↑' ? { top: '-10px', left: '50%', transform: 'translateX(-50%)' } : {})
                    }}>
                      {arrow}
                    </div>
                  )}
                  
                  {/* Players */}
                  <AnimatePresence>
                    {playerPositions.left === index && (
                      <motion.div
                        layoutId="player-left-spiral"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        style={{
                          position: 'absolute',
                          top: shapeType === 1 ? '20%' : 0, // Adjust for Triangle
                          left: shapeType === 3 ? '25%' : 0, // Adjust for Rhombus
                          width: '24px', height: '24px',
                          borderRadius: '50%',
                          border: '2px solid #fff',
                          overflow: 'hidden',
                          zIndex: 10,
                          background: '#2196F3',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }}
                      >
                         {leftAvatar && <img src={leftAvatar} alt="" style={{width:'100%',height:'100%'}}/>}
                      </motion.div>
                    )}
                    {playerPositions.right === index && (
                      <motion.div
                        layoutId="player-right-spiral"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        style={{
                          position: 'absolute',
                          bottom: 0, 
                          right: shapeType === 3 ? '25%' : 0, // Adjust for Rhombus
                          width: '24px', height: '24px',
                          borderRadius: '50%',
                          border: '2px solid #fff',
                          overflow: 'hidden',
                          zIndex: 10,
                          background: '#FF5252',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }}
                      >
                         {rightAvatar && <img src={rightAvatar} alt="" style={{width:'100%',height:'100%'}}/>}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                
                {/* Animal Decorations */}
                {decoration && (
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    fontSize: '1.8rem',
                    zIndex: 5,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                    animation: 'float 3s ease-in-out infinite'
                  }}>
                    {decoration}
                  </div>
                )}
              </div>
            );
          })
        ))}
      </div>
    );
  };

  const renderBasicBoard = () => {
    const steps = [];
    for (let i = 0; i <= TOTAL_STEPS; i++) {
       steps.push(i);
    }

    return (
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignContent: 'center',
        gap: '8px',
        padding: '10px'
      }}>
        {steps.map((step) => {
           const isSpecial = SPECIAL_TILES[step];
           return (
             <motion.div
               key={step}
               style={{
                 width: '40px',
                 height: '40px',
                 borderRadius: '8px',
                 background: step === 0 ? '#4CAF50' : (step === TOTAL_STEPS ? '#FFD700' : (isSpecial ? isSpecial.color : 'rgba(255,255,255,0.3)')),
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 fontSize: '0.8rem',
                 color: step === 0 || step === TOTAL_STEPS || isSpecial ? '#fff' : '#333',
                 fontWeight: 'bold',
                 position: 'relative',
                 boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                 border: '1px solid rgba(255,255,255,0.2)'
               }}
             >
               {step === 0 ? '起' : (step === TOTAL_STEPS ? '终' : (isSpecial ? <isSpecial.icon size={16} /> : step))}
               
               {/* Players */}
               <AnimatePresence>
                 {playerPositions.left === step && (
                   <motion.div
                     layoutId="player-left"
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     exit={{ scale: 0 }}
                     style={{
                       position: 'absolute',
                       top: '-10px',
                       left: '-5px',
                       width: '30px',
                       height: '30px',
                       borderRadius: '50%',
                       border: '2px solid #fff',
                       overflow: 'hidden',
                       zIndex: 10,
                       boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                     }}
                   >
                     {leftAvatar ? (
                       <img src={leftAvatar} alt="Left" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     ) : (
                       <div style={{ width: '100%', height: '100%', background: '#2196F3' }} />
                     )}
                   </motion.div>
                 )}
                 {playerPositions.right === step && (
                   <motion.div
                     layoutId="player-right"
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     exit={{ scale: 0 }}
                     style={{
                       position: 'absolute',
                       bottom: '-10px',
                       right: '-5px',
                       width: '30px',
                       height: '30px',
                       borderRadius: '50%',
                       border: '2px solid #fff',
                       overflow: 'hidden',
                       zIndex: 10,
                       boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                     }}
                   >
                     {rightAvatar ? (
                       <img src={rightAvatar} alt="Right" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     ) : (
                       <div style={{ width: '100%', height: '100%', background: '#FF5252' }} />
                     )}
                   </motion.div>
                 )}
               </AnimatePresence>
             </motion.div>
           );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        width: '100%',
        height: '100%',
        padding: '20px',
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (typeof onBackToMode === 'function') {
            onBackToMode();
          } else {
            onEndGame && onEndGame();
          }
        }}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          borderRadius: '9999px',
          border: '1px solid rgba(0,0,0,0.1)',
          background: 'rgba(255,255,255,0.9)',
          color: '#333',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 60,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        <ArrowLeft size={18} /> 返回
      </motion.button>

      {/* Header / Log */}
      <div style={{
        background: 'rgba(255,255,255,0.8)',
        padding: '10px 20px',
        borderRadius: '20px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '80%',
        minWidth: '300px'
      }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
          {winner ? (
            <span style={{ color: '#4CAF50' }}>游戏结束！{winner === 'left' ? leftName : rightName} 获胜！</span>
          ) : (
            gameLog
          )}
        </div>
      </div>

      {/* Board Area */}
      <div style={{
        flex: 1,
        width: '100%',
        maxWidth: (isHeatingUp || isIntimate) ? '1000px' : '600px',
        background: isIntimate 
          ? 'linear-gradient(135deg, rgba(74, 0, 224, 0.6) 0%, rgba(142, 45, 226, 0.6) 100%)' 
          : (isHeatingUp ? 'rgba(255, 225, 231, 0.6)' : 'rgba(255,255,255,0.2)'),
        borderRadius: '20px',
        backdropFilter: 'blur(5px)',
        overflowY: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isIntimate ? '0 0 50px rgba(138, 43, 226, 0.3)' : 'none'
      }}>
        {isIntimate ? renderIntimateBoard() : (isHeatingUp ? renderSpiralBoard() : renderBasicBoard())}
      </div>

      {/* Task Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
          >
            <motion.div
              layoutId="task-card"
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              style={{
                background: 'linear-gradient(135deg, #FFF0F5 0%, #FFFFFF 100%)',
                padding: '40px',
                borderRadius: '24px',
                width: '80%',
                maxWidth: '400px',
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                border: '4px solid #FF7AB9',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                position: 'relative',
                alignItems: 'center'
              }}
            >
              <div style={{ 
                fontSize: '1.2rem', 
                color: '#888', 
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                当前任务
              </div>
              
              <motion.div 
                style={{ 
                  fontSize: '2rem', 
                  fontWeight: '900', 
                  color: '#E91E63',
                  lineHeight: '1.4',
                  textShadow: '2px 2px 0px rgba(0,0,0,0.05)',
                  minHeight: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {activeTask}
              </motion.div>
              
              <div style={{ fontSize: '1rem', color: '#666' }}>
                请按要求完成后继续
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowTaskModal(false);
                  if (resolveTaskRef.current) {
                    resolveTaskRef.current();
                    resolveTaskRef.current = null;
                  }
                }}
                style={{
                  padding: '16px 32px',
                  background: 'linear-gradient(to right, #FF7AB9, #FF4081)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(255, 64, 129, 0.4)',
                  marginTop: '10px',
                  width: '100%'
                }}
              >
                ✅ 已完成
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
      }}>
         {/* Dice Button */}
         <motion.button
           whileHover={{ scale: 1.1, rotate: 10 }}
           whileTap={{ scale: 0.9 }}
           onClick={rollDice}
           disabled={gameState !== 'playing' || isRolling}
           style={{
             width: '80px',
             height: '80px',
             borderRadius: '20px',
             border: 'none',
             background: currentPlayer === 'left' ? '#2196F3' : '#FF5252',
             color: 'white',
             fontSize: '2rem',
             fontWeight: 'bold',
             cursor: gameState !== 'playing' || isRolling ? 'not-allowed' : 'pointer',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
             opacity: gameState !== 'playing' ? 0.5 : 1
           }}
         >
           {isRolling ? <RefreshCw className="spin" size={32} /> : diceValue}
         </motion.button>

         <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontWeight: 'bold', color: '#333' }}>当前回合:</div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              padding: '5px 15px',
              background: 'white',
              borderRadius: '10px'
            }}>
               <div style={{
                 width: '24px', height: '24px', borderRadius: '50%',
                 background: currentPlayer === 'left' ? '#2196F3' : '#FF5252'
               }} />
               <span>{currentPlayer === 'left' ? leftName : rightName}</span>
            </div>
         </div>

         <motion.button
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={onEndGame}
           style={{
             padding: '12px 30px',
             borderRadius: '15px',
             border: 'none',
             background: '#757575',
             color: 'white',
             fontSize: '1rem',
             fontWeight: 'bold',
             cursor: 'pointer',
             display: 'flex',
             alignItems: 'center',
             gap: '8px',
             boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
           }}
         >
           <LogOut size={20} /> 退出
         </motion.button>
      </div>
      
      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};

const CoupleAvatar = () => {
  const [leftAvatar, setLeftAvatar] = useState(localStorage.getItem('couple_left_avatar'));
  const [rightAvatar, setRightAvatar] = useState(localStorage.getItem('couple_right_avatar'));

  useEffect(() => {
    // Poll for changes in localStorage to sync with AboutUs page updates
    const interval = setInterval(() => {
      const storedLeft = localStorage.getItem('couple_left_avatar');
      const storedRight = localStorage.getItem('couple_right_avatar');
      
      if (storedLeft !== leftAvatar) setLeftAvatar(storedLeft);
      if (storedRight !== rightAvatar) setRightAvatar(storedRight);
    }, 1000);

    return () => clearInterval(interval);
  }, [leftAvatar, rightAvatar]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: 'spring' }}
      style={{
        position: 'absolute',
        top: '30px',
        right: '40px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(8px)',
        padding: '8px 16px',
        borderRadius: '30px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Left Avatar */}
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '2px solid rgba(255, 255, 255, 0.8)',
        background: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {leftAvatar ? (
          <img src={leftAvatar} alt="Him" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <User size={24} color="#6495ED" />
        )}
      </div>

      {/* Connecting Heart */}
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Heart size={20} color="#FFB6C1" fill="#FFB6C1" />
      </motion.div>

      {/* Right Avatar */}
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '2px solid rgba(255, 255, 255, 0.8)',
        background: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {rightAvatar ? (
          <img src={rightAvatar} alt="Her" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <User size={24} color="#FF69B4" />
        )}
      </div>
    </motion.div>
  );
};

const GAMES = [
  { id: 1, name: '五子棋', icon: <Grid3X3 size={32} />, color: '#FFB6C1', desc: '经典对弈' },
  { id: 3, name: '飞行棋', icon: <Dice5 size={32} />, color: '#98FB98', desc: '运气比拼' },
  { id: 5, name: '2048', icon: <Grid3X3 size={32} />, color: '#F0E68C', desc: '合成2048即为胜利' },
  { id: 6, name: '贪吃蛇', icon: <Gamepad2 size={32} />, color: '#FF7F50', desc: '童年回忆' },
  { id: 7, name: '扫雷', icon: <Construction size={32} />, color: '#B0C4DE', desc: '逻辑推理' },
  { id: 8, name: '俄罗斯方块', icon: <Puzzle size={32} />, color: '#FF69B4', desc: '反应挑战' },
  { id: 9, name: '真心话大冒险', icon: <MessageCircle size={32} />, color: '#E91E63', desc: '情感升温' },
  { id: 10, name: '女巫', icon: <Ghost size={32} />, color: '#9C27B0', desc: '神秘探险' },
  { id: 11, name: '颜色变化', icon: <Activity size={32} />, color: '#00BCD4', desc: '色彩反应' },
  { id: 12, name: '点击数字', icon: <Pointer size={32} />, color: '#3F51B5', desc: '按序挑战' },
];

const MOCK_STATS_LEFT = [
  { id: 1, name: '五子棋', total: 42, wins: 24, winRate: 57, icon: <Grid3X3 size={24} />, color: '#FFB6C1' },
  { id: 3, name: '飞行棋', total: 8, wins: 3, winRate: 37, icon: <Dice5 size={24} />, color: '#98FB98' },
  { id: 5, name: '2048', total: 12, wins: 2, winRate: 16, icon: <Grid3X3 size={24} />, color: '#F0E68C' },
  { id: 6, name: '贪吃蛇', total: 30, wins: 18, winRate: 60, icon: <Gamepad2 size={24} />, color: '#FF7F50' },
  { id: 9, name: '真心话大冒险', total: 12, wins: 5, winRate: 42, icon: <MessageCircle size={24} />, color: '#E91E63' },
  { id: 10, name: '女巫', total: 0, wins: 0, winRate: 0, icon: <Ghost size={24} />, color: '#9C27B0' },
  { id: 11, name: '颜色变化', total: 0, wins: 0, winRate: 0, icon: <Activity size={24} />, color: '#00BCD4' },
  { id: 12, name: '点击数字', total: 0, wins: 0, winRate: 0, icon: <Pointer size={24} />, color: '#3F51B5' },
];

const MOCK_STATS_RIGHT = [
  { id: 1, name: '五子棋', total: 38, wins: 14, winRate: 36, icon: <Grid3X3 size={24} />, color: '#FFB6C1' },
  { id: 3, name: '飞行棋', total: 10, wins: 6, winRate: 60, icon: <Dice5 size={24} />, color: '#98FB98' },
  { id: 5, name: '2048', total: 15, wins: 8, winRate: 53, icon: <Grid3X3 size={24} />, color: '#F0E68C' },
  { id: 6, name: '贪吃蛇', total: 25, wins: 10, winRate: 40, icon: <Gamepad2 size={24} />, color: '#FF7F50' },
  { id: 9, name: '真心话大冒险', total: 12, wins: 7, winRate: 58, icon: <MessageCircle size={24} />, color: '#E91E63' },
  { id: 10, name: '女巫', total: 0, wins: 0, winRate: 0, icon: <Ghost size={24} />, color: '#9C27B0' },
  { id: 11, name: '颜色变化', total: 0, wins: 0, winRate: 0, icon: <Activity size={24} />, color: '#00BCD4' },
  { id: 12, name: '点击数字', total: 0, wins: 0, winRate: 0, icon: <Pointer size={24} />, color: '#3F51B5' },
];

const GamePage = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'stats'
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState('left'); // 'left' | 'right'
  const [isLocked, setIsLocked] = useState(false); // New state for screen lock
  const [selectedMode, setSelectedMode] = useState('基础版');
  const [gomokuSize, setGomokuSize] = useState(15);
  const [witchItemCount, setWitchItemCount] = useState(16);
  const [witchPoisonCount, setWitchPoisonCount] = useState(1);
  const [punishmentActive, setPunishmentActive] = useState(false);
  const [punishmentText, setPunishmentText] = useState('');
  const [punishmentLoser, setPunishmentLoser] = useState(null);
  const [punishmentResolve, setPunishmentResolve] = useState(null);
  const [punishmentType, setPunishmentType] = useState('truth');

  // Toggle lock state
  const toggleLock = () => {
    setIsLocked(!isLocked);
  };

  // Effect to handle scroll lock and potential resize blocking
  useEffect(() => {
    const prevent = (e) => { e.preventDefault(); };
    const preventKeys = (e) => {
      const keys = ['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' ','Space'];
      if (keys.includes(e.key)) e.preventDefault();
    };
    if (isLocked) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('wheel', prevent, { passive: false });
      window.addEventListener('touchmove', prevent, { passive: false });
      window.addEventListener('keydown', preventKeys);
    } else {
      document.body.style.overflow = 'auto';
      window.removeEventListener('wheel', prevent);
      window.removeEventListener('touchmove', prevent);
      window.removeEventListener('keydown', preventKeys);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('wheel', prevent);
      window.removeEventListener('touchmove', prevent);
      window.removeEventListener('keydown', preventKeys);
    };
  }, [isLocked]);

  const leftName = localStorage.getItem('couple_left_name') || 'LkbHua';
  const rightName = localStorage.getItem('couple_right_name') || 'ZengQ';
  const leftAvatar = localStorage.getItem('couple_left_avatar');
  const rightAvatar = localStorage.getItem('couple_right_avatar');

  const MODE_OPTIONS = [
    { key: '温和版', color: '#8BC34A', icon: <Circle size={18} /> },
    { key: '热恋版', color: '#FF5252', icon: <Heart size={18} /> },
    { key: '升温版', color: '#FF9800', icon: <Zap size={18} /> },
    { key: '亲密版', color: '#9C27B0', icon: <Star size={18} /> },
    { key: '基础版', color: '#2196F3', icon: <Diamond size={18} /> },
  ];

  const TRUTH_OR_DARE_MODES = [
    { key: '温和版', color: '#8BC34A', icon: <Circle size={18} /> },
    { key: '热恋版', color: '#FF5252', icon: <Heart size={18} /> },
    { key: '亲密版', color: '#9C27B0', icon: <Star size={18} /> },
  ];

  const currentStats = currentPlayer === 'left' ? MOCK_STATS_LEFT : MOCK_STATS_RIGHT;
  const currentName = currentPlayer === 'left' ? leftName : rightName;
  const currentAvatar = currentPlayer === 'left' ? leftAvatar : rightAvatar;
  const defaultAvatarColor = currentPlayer === 'left' ? '#6495ED' : '#FF69B4';

  const totalGames = currentStats.reduce((acc, curr) => acc + curr.total, 0);
  const totalWins = currentStats.reduce((acc, curr) => acc + curr.wins, 0);
  const overallWinRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

  // Pastel accent colors
  const accents = [
    'rgba(230, 230, 250, 0.4)', // Pale Purple
    'rgba(173, 216, 230, 0.4)', // Pale Blue
    'rgba(240, 248, 255, 0.4)', // Blue White
    'rgba(255, 255, 224, 0.4)', // Pale Yellow
    'rgba(144, 238, 144, 0.4)', // Pale Green
    'rgba(255, 182, 193, 0.4)'  // Pale Pink
  ];

  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setGameStarted(false);
    if (game.id === 9) {
      setSelectedMode('温和版');
    } else {
      setSelectedMode('基础版');
    }
  };

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleQuitGame = () => {
    setGameStarted(false);
    setSelectedGame(null);
    setIsLocked(false); // Reset lock state when quitting
  };
  
  const handleBackToMode = () => {
    setGameStarted(false);
    // Keep selectedGame to remain in the game's mode selection view
  };
  
  const handleRequirePunishment = (loser, ready) => {
    const truthPool = [...GENTLE_TRUTHS, ...HOT_TRUTHS, ...INTIMATE_TRUTHS];
    const darePool = [...GENTLE_DARES, ...HOT_DARES, ...INTIMATE_DARES];
    const isTruth = Math.random() < 0.5;
    const pool = isTruth ? truthPool : darePool;
    const idx = Math.floor(Math.random() * pool.length);
    setPunishmentText(pool[idx]);
    setPunishmentType(isTruth ? 'truth' : 'dare');
    setPunishmentLoser(loser);
    setPunishmentActive(true);
    setPunishmentResolve(() => ready);
  };

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh', // Allow content to grow
      backgroundColor: '#838896',
      position: 'relative',
      overflowX: 'hidden', // Prevent horizontal scroll
      overflowY: isLocked ? 'hidden' : 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: gameStarted ? '0px' : '120px',
      flexDirection: 'column',
      boxSizing: 'border-box'
    }}>
      {/* Couple Avatar */}
      <CoupleAvatar />

      {/* Couple Avatar */}
      <CoupleAvatar />

      {punishmentActive && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            border: '1px solid rgba(0,0,0,0.08)',
            padding: '28px',
            width: 'min(560px, 92%)',
            color: '#333'
          }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '10px', color: '#E91E63' }}>惩罚环节</div>
            <div style={{ marginBottom: '10px', fontWeight: 700 }}>
              失败方：<span style={{ color: '#444' }}>
                {punishmentLoser === 'black' ? '黑方' : (
                  punishmentLoser === 'white' ? '白方' : (
                    punishmentLoser === 'left' ? (localStorage.getItem('couple_left_name') || '左方') : (localStorage.getItem('couple_right_name') || '右方')
                  )
                )}
              </span>
            </div>
            <div style={{ marginBottom: '8px', fontWeight: 700 }}>
              类型：<span style={{ color: punishmentType === 'truth' ? '#3F51B5' : '#FF9800' }}>{punishmentType === 'truth' ? '真心话' : '大冒险'}</span>
            </div>
            <div style={{ background: '#fff3f7', border: '1px solid #ffd1df', borderRadius: '12px', padding: '12px', color: '#C2185B', marginBottom: '16px' }}>
              题目：{punishmentText}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  const newType = punishmentType === 'truth' ? 'dare' : 'truth';
                  setPunishmentType(newType);
                  const truthPool = [...GENTLE_TRUTHS, ...HOT_TRUTHS, ...INTIMATE_TRUTHS];
                  const darePool = [...GENTLE_DARES, ...HOT_DARES, ...INTIMATE_DARES];
                  const pool = newType === 'truth' ? truthPool : darePool;
                  const idx = Math.floor(Math.random() * pool.length);
                  setPunishmentText(pool[idx]);
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '16px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: '#ffffff',
                  color: '#333',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  cursor: 'pointer'
                }}
              >
                切换题库
              </button>
              <button
                onClick={() => {
                  const truthPool = [...GENTLE_TRUTHS, ...HOT_TRUTHS, ...INTIMATE_TRUTHS];
                  const darePool = [...GENTLE_DARES, ...HOT_DARES, ...INTIMATE_DARES];
                  const pool = punishmentType === 'truth' ? truthPool : darePool;
                  const idx = Math.floor(Math.random() * pool.length);
                  setPunishmentText(pool[idx]);
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '16px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: '#ffffff',
                  color: '#333',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  cursor: 'pointer'
                }}
              >
                换一个题目
              </button>
              <button
                onClick={() => {
                  if (punishmentResolve) punishmentResolve();
                  setPunishmentActive(false);
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '16px',
                  border: 'none',
                  background: '#4CAF50',
                  color: '#fff',
                  fontWeight: 700,
                  boxShadow: '0 8px 20px rgba(76,175,80,0.25)',
                  cursor: 'pointer'
                }}
              >
                我已完成惩罚
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Game Header Component - Top Left */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, type: 'spring' }}
        style={{
            position: 'absolute', // Kept absolute for positioning
            top: '30px',
            left: '75px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            zIndex: 50,
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            padding: '10px 20px 10px 10px',
            borderRadius: '40px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Logo Icon */}
        <div style={{
            position: 'relative',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%'
        }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '2px dashed rgba(255, 255, 255, 0.5)'
                }}
            />
            <Gamepad2 size={28} color="#fff" />
        </div>

        {/* Titles */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{
                fontSize: '1.2rem',
                color: '#fff',
                margin: 0,
                fontWeight: '600',
                letterSpacing: '1px',
                textShadow: '0 1px 4px rgba(0,0,0,0.1)'
            }}>
                趣味游戏
            </h2>
            <h3 style={{
                fontSize: '0.7rem',
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: '400',
                letterSpacing: '1px',
                margin: 0,
                textAlign: 'left'
            }}>
                Fun Games
            </h3>
        </div>

        {/* Lock Button (Integrated into Header) */}
        <AnimatePresence>
          {gameStarted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: 'auto' }}
              exit={{ opacity: 0, scale: 0.8, width: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginLeft: '10px',
                paddingLeft: '15px',
                borderLeft: '1px solid rgba(255,255,255,0.3)',
                overflow: 'hidden'
              }}
            >
              <motion.button
                whileHover={{ scale: 1.1, rotate: isLocked ? 0 : 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleLock}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  background: isLocked ? '#FF5252' : '#4CAF50',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: `0 4px 10px ${isLocked ? 'rgba(255, 82, 82, 0.4)' : 'rgba(76, 175, 80, 0.4)'}`,
                  transition: 'background 0.3s ease',
                  flexShrink: 0
                }}
              >
                <AnimatePresence mode="wait">
                  {isLocked ? (
                    <motion.div
                      key="lock"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Lock size={18} strokeWidth={2.5} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="unlock"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Unlock size={18} strokeWidth={2.5} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
              
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={isLocked ? 'locked-text' : 'unlocked-text'}
                style={{
                  color: isLocked ? '#FF5252' : '#4CAF50',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap',
                  background: 'rgba(255,255,255,0.8)',
                  padding: '4px 8px',
                  borderRadius: '8px'
                }}
              >
                {isLocked ? "已定身" : "可调整"}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Background Effects */}
      {/* Floating Orbs / Ripples */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, Math.random() * 40 - 20, 0],
            y: [0, Math.random() * 40 - 20, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5
          }}
          style={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${200 + Math.random() * 300}px`,
            height: `${200 + Math.random() * 300}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${accents[i % accents.length]} 0%, transparent 70%)`,
            filter: 'blur(40px)',
            zIndex: 1
          }}
        />
      ))}

      {/* Content Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{
          zIndex: 10,
          background: 'transparent',
          padding: gameStarted ? '120px 0 0 0' : '40px 60px', // Add top padding for game header
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: gameStarted ? 'center' : 'flex-start', // Center content vertically when game started
          gap: '20px',
          width: '100%',
          maxWidth: '1200px', // Increased width
          minHeight: gameStarted ? '100vh' : 'calc(100vh - 160px)', // Use minHeight instead of fixed height
          position: 'relative', // Add relative positioning
          // overflowY: 'auto' // Removed internal scroll
        }}
      >
        {/* Tabs */}
        <AnimatePresence>
        {!gameStarted && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            display: 'flex',
            gap: '20px',
            background: 'rgba(0,0,0,0.1)',
            padding: '6px',
            borderRadius: '20px',
            marginBottom: '20px',
            overflow: 'hidden'
          }}
        >
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '10px 24px',
              borderRadius: '16px',
              border: 'none',
              background: activeTab === 'all' ? 'rgba(255,255,255,0.9)' : 'transparent',
              color: activeTab === 'all' ? '#666' : 'rgba(255,255,255,0.7)',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: activeTab === 'all' ? '0 4px 10px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Gamepad2 size={18} />
            所有游戏
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            style={{
              padding: '10px 24px',
              borderRadius: '16px',
              border: 'none',
              background: activeTab === 'stats' ? 'rgba(255,255,255,0.9)' : 'transparent',
              color: activeTab === 'stats' ? '#666' : 'rgba(255,255,255,0.7)',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: activeTab === 'stats' ? '0 4px 10px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Trophy size={18} />
            游戏胜率
          </button>
        </motion.div>
        )}
        </AnimatePresence>

        <div style={{ width: '100%', flex: 1, position: 'relative' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'all' && !selectedGame ? (
              <motion.div
                key="all"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ transition: { staggerChildren: 0.05 } }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '24px',
                  width: '100%',
                  padding: '10px'
                }}
              >
                {GAMES.map((game, index) => (
                  <motion.div
                    key={game.id}
                    custom={index}
                    layoutId={`game-card-${game.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={(i) => ({
                      x: (i % 4 < 2) ? -1000 : 1000,
                      opacity: 0,
                      transition: { duration: 0.5, ease: "easeInOut" }
                    })}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectGame(game)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.85)',
                      borderRadius: '24px', // 方圆形
                      aspectRatio: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
                      padding: '20px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '20px',
                      background: game.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}>
                      {game.icon}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontWeight: 'bold', color: '#444', fontSize: '1.1rem' }}>{game.name}</span>
                      <span style={{ fontSize: '0.8rem', color: '#888' }}>{game.desc}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : activeTab === 'all' && selectedGame ? (
              <motion.div
                key="game-detail"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ duration: 0.5 }}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '40px',
                  position: 'relative'
                }}
              >
                {/* Game Title & Icon */}
                <motion.div
                   initial={{ scale: 0.8, opacity: 0 }}
                   animate={{ 
                      scale: 1, 
                      opacity: 1,
                      position: gameStarted ? 'absolute' : 'relative',
                      top: gameStarted ? '30px' : 'auto', // Position relative to content container
                      left: gameStarted ? '140px' : 'auto', // Adjust based on GameHeader width
                      flexDirection: gameStarted ? 'row' : 'column',
                      gap: gameStarted ? '15px' : '20px'
                    }}
                   transition={{ duration: 0.5, type: "spring" }}
                   style={{
                     display: 'flex',
                     alignItems: 'center',
                     zIndex: 20
                   }}
                >
                  <div style={{
                    width: gameStarted ? '50px' : '100px',
                    height: gameStarted ? '50px' : '100px',
                    borderRadius: gameStarted ? '15px' : '30px',
                    background: selectedGame.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    transition: 'all 0.5s ease'
                  }}>
                    {React.cloneElement(selectedGame.icon, { size: gameStarted ? 24 : 48 })}
                  </div>
                  <div>
                    <h1 style={{ 
                      fontSize: gameStarted ? '1.5rem' : '3rem', 
                      color: '#fff', 
                      margin: 0, 
                      textShadow: '0 4px 10px rgba(0,0,0,0.2)',
                      textAlign: gameStarted ? 'left' : 'center',
                      transition: 'all 0.5s ease'
                    }}>
                      {selectedGame.name}
                    </h1>
                    {!gameStarted && (
                      <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>{selectedGame.desc}</p>
                    )}
                  </div>
                </motion.div>
                
                {/* Game Logic Render Area */}
                <div style={{
                  // Position logic relative to content container
          position: 'relative',
          width: gameStarted ? '100%' : '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: gameStarted ? 0 : '20px',
          flex: gameStarted ? 1 : 'none', // Allow it to expand
          transition: 'all 0.5s ease'
        }}>
                {gameStarted ? (
                  selectedGame.id === 1 ? (
                    <GomokuGame onEndGame={handleQuitGame} gridSize={gomokuSize} onRequirePunishment={handleRequirePunishment} />
                  ) : selectedGame.id === 7 ? (
                    <MinesweeperGame onEndGame={handleQuitGame} onRequirePunishment={handleRequirePunishment} currentPlayer={currentPlayer} />
                  ) : selectedGame.id === 6 ? (
                    <SnakeGame onEndGame={handleQuitGame} onRequirePunishment={handleRequirePunishment} />
                  ) : selectedGame.id === 3 ? (
                    <FlyingChessGame onEndGame={handleQuitGame} onBackToMode={handleBackToMode} mode={selectedMode} />
                  ) : selectedGame.id === 9 ? (
                    <TruthOrDareGame onEndGame={handleQuitGame} onBackToMode={handleBackToMode} mode={selectedMode} isLocked={isLocked} />
                  ) : selectedGame.id === 5 ? (
                    <Game2048 onEndGame={handleQuitGame} onRequirePunishment={handleRequirePunishment} />
      ) : selectedGame.id === 10 ? (
                    <WitchGame 
                      onEndGame={handleQuitGame} 
                      onRequirePunishment={handleRequirePunishment}
                      itemCount={witchItemCount}
                      poisonCount={witchPoisonCount}
                    />
      ) : selectedGame.id === 11 ? (
        <ColorChangeGame onEndGame={handleQuitGame} onRequirePunishment={handleRequirePunishment} />
      ) : selectedGame.id === 12 ? (
        <ClickNumberGame onEndGame={handleQuitGame} onRequirePunishment={handleRequirePunishment} />
                  ) : (
                    <div style={{
                      padding: '40px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '20px',
                      color: '#fff',
                      fontSize: '1.2rem',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      游戏正在开发中...
                    </div>
                  )
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginTop: '20px', width: '100%' }}>
                    {(selectedGame?.id === 3 || selectedGame?.id === 9) && (
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        padding: '20px',
                        borderRadius: '24px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(255,255,255,0.6)',
                        width: 'min(600px, 90%)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px' }}>
                          {(selectedGame?.id === 9 ? TRUTH_OR_DARE_MODES : MODE_OPTIONS).map(mode => (
                            <motion.button
                              key={mode.key}
                              whileHover={{ y: -2, scale: 1.05 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setSelectedMode(mode.key)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                borderRadius: '16px',
                                border: selectedMode === mode.key ? '2px solid #4CAF50' : '1px solid rgba(0,0,0,0.08)',
                                background: 'rgba(255,255,255,0.95)',
                                boxShadow: selectedMode === mode.key ? '0 6px 20px rgba(76,175,80,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                                color: '#333',
                                cursor: 'pointer'
                              }}
                            >
                              <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '8px',
                                background: mode.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
                              }}>
                                {mode.icon}
                              </div>
                              <span style={{ fontWeight: 'bold' }}>{mode.key}</span>
                            </motion.button>
                          ))}
                        </div>
                        <div style={{ marginTop: '10px', textAlign: 'center', color: '#666', fontSize: '0.95rem' }}>
                          当前选择：<span style={{ color: '#333', fontWeight: 700 }}>{selectedMode}</span>
                        </div>
                      </div>
                    )}

                    {selectedGame?.id === 1 && (
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        padding: '20px',
                        borderRadius: '24px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(255,255,255,0.6)',
                        width: 'min(600px, 90%)'
                      }}>
                        <div style={{ marginBottom: '10px', textAlign: 'center', color: '#333', fontWeight: 700 }}>
                          棋盘大小：{gomokuSize} × {gomokuSize}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          {[10,11,12,13,14,15].map(size => (
                            <motion.button
                              key={size}
                              whileHover={{ y: -2, scale: 1.05 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setGomokuSize(size)}
                              style={{
                                padding: '8px 14px',
                                borderRadius: '14px',
                                border: gomokuSize === size ? '2px solid #2196F3' : '1px solid rgba(0,0,0,0.08)',
                                background: 'rgba(255,255,255,0.95)',
                                boxShadow: gomokuSize === size ? '0 6px 20px rgba(33,150,243,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                                color: '#333',
                                cursor: 'pointer',
                                fontWeight: 700
                              }}
                            >
                              {size}×{size}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    

                    <div style={{ display: 'flex', gap: '20px' }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStartGame}
                        style={{
                          padding: '15px 40px',
                          borderRadius: '20px',
                          border: 'none',
                          background: '#4CAF50',
                          color: 'white',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          boxShadow: '0 8px 20px rgba(76, 175, 80, 0.3)'
                        }}
                      >
                        <Play size={24} fill="currentColor" /> {(selectedGame?.id === 3 || selectedGame?.id === 9) ? `开始游戏（${selectedMode}）` : (selectedGame?.id === 1 ? `开始游戏（${gomokuSize}×${gomokuSize}）` : '开始游戏')}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleQuitGame}
                        style={{
                          padding: '15px 40px',
                          borderRadius: '20px',
                          border: 'none',
                          background: '#FF5252',
                          color: 'white',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          boxShadow: '0 8px 20px rgba(255, 82, 82, 0.3)'
                        }}
                      >
                        <LogOut size={24} /> 退出游戏
                      </motion.button>
                    </div>
                  </div>
                )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="stats"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                  padding: '10px'
                }}
              >
                {/* Overall Stats Card */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.9) 0%, rgba(37, 117, 252, 0.9) 100%)',
                    borderRadius: '24px',
                    padding: '30px',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    boxShadow: '0 10px 30px rgba(37, 117, 252, 0.3)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  {/* Player Info Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingBottom: '20px',
                    borderBottom: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '50%', 
                        overflow: 'hidden', 
                        border: '3px solid rgba(255,255,255,0.8)',
                        background: '#fff',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                      }}>
                         {currentAvatar ? (
                          <img src={currentAvatar} alt={currentName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <User size={32} color={defaultAvatarColor} />
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{currentName}</h2>
                        <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>游戏数据统计</span>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPlayer(prev => prev === 'left' ? 'right' : 'left')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.4)',
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backdropFilter: 'blur(5px)'
                      }}
                    >
                      <RefreshCw size={16} /> 切换玩家
                    </motion.button>
                  </div>

                  {/* Stats Data */}
                  <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '3rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <TrendingUp size={32} /> {overallWinRate}%
                      </div>
                      <div style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: '5px' }}>综合胜率</div>
                    </div>
                    <div style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.2)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalGames}</div>
                      <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>总场次</div>
                    </div>
                    <div style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.2)' }} />
                     <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalWins}</div>
                      <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>胜场</div>
                    </div>
                  </div>
                </motion.div>

                {/* Game Stats List */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '20px',
                  overflowY: isLocked ? 'hidden' : 'auto',
                  paddingBottom: '20px',
                  paddingRight: '5px' // Prevent scrollbar overlap
                }}>
                  {currentStats.map((stat, index) => {
                     const game = GAMES.find(g => g.id === stat.id);
                     return (
                    <motion.div
                      key={stat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      whileHover={{ y: -5, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '24px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        border: '1px solid rgba(255,255,255,0.5)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '16px',
                            background: stat.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                          }}>
                            {stat.icon}
                          </div>
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#333', fontSize: '1.1rem' }}>{stat.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>{game?.desc || '精彩对决'}</div>
                          </div>
                        </div>
                        <div style={{ 
                          padding: '6px 14px', 
                          borderRadius: '14px', 
                          background: stat.winRate >= 50 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 82, 82, 0.1)',
                          color: stat.winRate >= 50 ? '#4CAF50' : '#FF5252',
                          fontWeight: '800',
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {stat.winRate}%
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666', fontWeight: '500' }}>
                            <span>胜率进度</span>
                            <span>{stat.wins}/{stat.total} 胜</span>
                         </div>
                         <div style={{ width: '100%', height: '10px', background: '#f0f2f5', borderRadius: '5px', overflow: 'hidden' }}>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${stat.winRate}%` }}
                              transition={{ duration: 1, delay: 0.5 + index * 0.1, type: "spring", stiffness: 50 }}
                              style={{ 
                                height: '100%', 
                                background: stat.color,
                                borderRadius: '5px'
                              }} 
                            />
                          </div>
                      </div>
                    </motion.div>
                  );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default GamePage;
