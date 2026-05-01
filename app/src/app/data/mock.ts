export interface KnowledgeCard {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  source: string;
}

export const CATEGORIES = [
  { id: 'all', name: '全部', icon: 'Sparkles' },
  { id: 'daily_life', name: '生活常识', icon: 'Lightbulb' },
  { id: 'nature', name: '大自然奥秘', icon: 'Leaf' },
  { id: 'science', name: '科学原理', icon: 'FlaskConical' },
  { id: 'math', name: '数学趣题', icon: 'Calculator' },
  { id: 'history', name: '历史故事', icon: 'BookOpen' },
  { id: 'body', name: '人体奥秘', icon: 'User' },
  { id: 'universe', name: '宇宙探索', icon: 'Globe' },
  { id: 'food', name: '美食文化', icon: 'Utensils' },
  { id: 'geography', name: '地理奇观', icon: 'Map' },
  { id: 'art', name: '艺术人文', icon: 'Palette' }
];

export const MOCK_CARDS: KnowledgeCard[] = [
  {
    id: '1',
    title: '为什么手机屏幕越看越累？',
    description: '手机屏幕发出的蓝光波长较短，能量较高，能够直接穿透晶状体直达视网膜黄斑部。长时间盯着屏幕，不仅会导致视疲劳，还可能引起干眼症和视力下降。此外，看手机时我们眨眼的频率会无意识地降低，导致泪液蒸发过快。',
    image: 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWdodGJ1bGIlMjBpZGVhfGVufDF8fHx8MTc3NzU1OTM1NHww&ixlib=rb-4.1.0&q=80&w=1080',
    category: '生活常识',
    source: '眼科健康指南'
  },
  {
    id: '2',
    title: '章鱼有三颗心脏',
    description: '章鱼拥有三颗心脏。其中两颗是鳃心，专门负责将血液泵入鳃部以吸收氧气；第三颗是体心，负责将富含氧气的血液泵送到全身。有趣的是，当章鱼游泳时，体心会停止跳动，这也是为什么它们更喜欢爬行而不是游泳的原因。',
    image: 'https://images.unsplash.com/photo-1728071485384-3602db0923ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjBncmVlbiUyMGZvcmVzdCUyMGxlYXZlc3xlbnwxfHx8fDE3Nzc1NTkzNTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '大自然奥秘',
    source: '海洋生物学百科'
  },
  {
    id: '3',
    title: '为什么天空是蓝色的？',
    description: '这种现象被称为“瑞利散射”。太阳光包含七种颜色的光，当光线穿过地球大气层时，波长较短的蓝光比波长较长的红光更容易被空气分子散射到各个方向。因此，当我们仰望天空时，看到的主要就是被散射的蓝光。',
    image: 'https://images.unsplash.com/photo-1614308457932-e16d85c5d053?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHNjaWVuY2UlMjBsYWJvcmF0b3J5JTIwbWljcm9zY29wZXxlbnwxfHx8fDE3Nzc1NTkzNTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '科学原理',
    source: '物理学常识'
  },
  {
    id: '4',
    title: '宇宙中真的有声音吗？',
    description: '严格来说，太空中由于几乎是真空状态，声波无法像在空气或水中那样传播。但是，科学家可以通过仪器将电磁波、引力波等转换为人类可以听到的声频，从而“听”到黑洞合并或是星系诞生的壮丽声音。',
    image: 'https://images.unsplash.com/photo-1709403906892-c6c2cb29f981?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdXRlciUyMHNwYWNlJTIwc3RhcnMlMjBwbGFuZXRzfGVufDF8fHx8MTc3NzU1OTM1NHww&ixlib=rb-4.1.0&q=80&w=1080',
    category: '宇宙探索',
    source: 'NASA科普'
  },
  {
    id: '5',
    title: '蒙娜丽莎为什么没有眉毛？',
    description: '关于达·芬奇名作《蒙娜丽莎》为何没有眉毛一直是个谜。后来的高分辨率扫描显示，达·芬奇确实画了眉毛和睫毛，但在数百年的修复和清洁过程中，这些脆弱的颜料层不小心被擦掉了。',
    image: 'https://images.unsplash.com/photo-1775309678887-811b74496530?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljYWwlMjBhcnQlMjBtdXNldW0lMjBwYWludGluZ3xlbnwxfHx8fDE3Nzc1NTkzNTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '艺术人文',
    source: '艺术史揭秘'
  }
];