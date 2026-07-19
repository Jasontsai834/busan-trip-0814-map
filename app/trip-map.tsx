"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Point = {
  name: string;
  category: string;
  area: string;
  latitude: number;
  longitude: number;
  why_go: string;
  google_maps_search: string;
  day: string;
  mustTry: string;
  sourceUrl: string;
  sourceLabel: string;
  menuUrl: string;
  brief?: string;
};

type LegacyPoint = Omit<Point, "day" | "mustTry" | "sourceUrl" | "sourceLabel" | "menuUrl"> & {
  stay_priority?: string;
};

declare global {
  interface Window {
    L?: any;
  }
}

const categories = [
  "全部",
  "景點",
  "餐廳",
  "小吃",
  "咖啡",
  "購物",
  "潮流服飾",
  "高爾夫",
  "Outlet",
  "雨備",
];

const days = ["全部", "8/14", "8/15", "8/16", "8/17", "8/18"];

const routeDays = [
  { day: "8/14", theme: "海雲台海岸", plan: "海灘、冬柏島、The Bay 101、海雲台市場" },
  { day: "8/15", theme: "東釜山 + Outlet", plan: "藍線公園、青沙浦、龍宮寺、東釜山 Outlet" },
  { day: "8/16", theme: "西面潮流逛街", plan: "西面地下街、田浦、百貨、高爾夫用品" },
  { day: "8/17", theme: "南浦 + 影島", plan: "甘川、札嘎其、BIFF、白淺灘、夜市" },
  { day: "8/18", theme: "伴手禮收尾", plan: "西面或 Centum 補貨，預留機場交通" },
];

const verifiedSources: Record<string, { url: string; label: string; mustTry?: string }> = {
  "海雲台藍線公園 尾浦站": {
    url: "https://www.bluelinepark.com/eng/?pageNo=1",
    label: "海雲台藍線公園官方",
  },
  "海東龍宮寺": { url: "https://www.visitbusan.net/index.do?menuCd=DOM_000000202001000000", label: "Visit Busan 官方" },
  "Gamcheon Culture Village": { url: "https://www.gamcheon.or.kr/", label: "甘川文化村官方" },
  "Songdo Marine Cable Car": { url: "https://busanaircruise.co.kr/eng/", label: "松島海上纜車官方" },
  "Busan X the Sky": { url: "https://busanxthesky.com/en/", label: "Busan X the Sky 官方" },
  "SEA LIFE 釜山水族館": { url: "https://www.visitsealife.com/busan/en/", label: "SEA LIFE 官方" },
  "Lotte Premium Outlet 東釜山": { url: "https://www.lotteshopping.com/store/main?cstrCd=0004", label: "樂天 Outlet 官方" },
  "新世界 Centum City / Spa Land": { url: "https://www.shinsegae.com/store/main.do?storeCd=SC00007", label: "新世界 Centum 官方" },
  "田浦咖啡街": { url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?menuSn=&vcontsId=192977", label: "VisitKorea 官方" },
  "Songjeong 3-dae Gukbap": {
    url: "https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=216936",
    label: "VisitKorea 店家資料",
    mustTry: "豬肉湯飯、內臟湯飯、白切肉",
  },
  "Bao Haus": {
    url: "https://guide.michelin.com/gb/en/busan-region/busan_1025838/restaurant/bao-haus",
    label: "Michelin Guide",
    mustTry: "刈包、滷肉飯、雞翅類小點",
  },
  "Yakitori Onjeong": {
    url: "https://guide.michelin.com/en/busan-region/busan_1025838/restaurant/yakitori-onjung",
    label: "Michelin Guide",
    mustTry: "串燒套餐、當日單點",
  },
  "Geumsu Bokguk 海雲台總店": {
    url: "https://dailyguidehub.tistory.com/11",
    label: "店家菜色整理",
    mustTry: "河豚湯、河豚皮拌菜、炸河豚",
  },
  "BIFF Square": { url: "https://biffsquare.com/en/visit", label: "BIFF Square 官方", mustTry: "堅果糖餅、魚板、炸物" },
  "Gukje Market": { url: "https://english.visitkorea.or.kr/enu/SHP/SH_EN_7_2.jsp?cid=705873", label: "VisitKorea 官方" },
  "Bupyeong Kkangtong Night Market": { url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=78106", label: "VisitKorea 官方" },
  "Lee Jae-mo Pizza": {
    url: "https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301002001000&uc_seq=124",
    label: "Visit Busan 店家資料",
    mustTry: "起司披薩、起司泡菜披薩",
  },
  "MOMOS Coffee 海雲台": { url: "https://www.momos.co.kr/", label: "MOMOS Coffee 官方" },
};

const foodNotes: Record<string, string> = {
  "海雲台傳統市場": "辣炒年糕、魚板、海鮮麵、糖餅",
  "古來思魚糕 海雲台店": "起司魚糕、蝦餃魚糕、現煮魚板湯",
  "海雲台小麥冷麵": "水冷麵、拌冷麵、餃子",
  "名品海雲台蔘雞湯": "蔘雞湯、鮑魚蔘雞湯",
  "海城烤腸店": "烤腸拼盤、炒飯",
  "Haeundae 31cm 海鮮刀削麵": "海鮮刀削麵、海鮮煎餅",
  "Standard Burn": "當日麵包、可頌、甜點咖啡",
  Prahran: "早午餐盤、咖啡",
  "RAW & SWEET": "招牌甜點、手沖或拿鐵",
  "BRONI Coffee": "手沖咖啡、當日甜點",
  Duplit: "奶油甜點、咖啡",
  "Busan Bada Sand": "招牌奶油夾心餅，適合伴手禮",
  "Keveren House": "Busan Butter Pie",
  "二代名菓 海雲台": "煎餅禮盒、傳統點心",
  "B&C 麵包店 海雲台": "紅豆麵包、奶油麵包",
  "Nasari 食堂 廣安里": "海景刀削麵、海鮮煎餅",
  "Chunhachudong Milmyeon": "水冷麵、拌冷麵、餃子",
  "Geoin Tongdak 西面": "炸全雞、啤酒",
  "Gaemijip 螞蟻鍋 西面": "辣章魚牛腸蝦鍋、拌飯",
  "World Village Gamjatang": "馬鈴薯排骨湯、骨髓飯",
  "Jeju-ga 西面店": "鮑魚粥、海鮮早餐",
  "Isaac Toast 西面": "火腿起司吐司、辣雞吐司",
  "西面布帳馬車街": "辣炒年糕、魚板、烤串；以現場攤位為準",
  "83haechi": "烤肉拼盤、冷麵",
  "Yeonundang": "季節刨冰、韓式甜點",
  "Hwa Bread": "紅豆奶油麵包",
  "LASOOP Rosters & Bakery": "烘焙麵包、手沖咖啡",
  "Famigo Churreria": "吉拿棒、沾醬",
  "Jagalchi Market": "現選海鮮、生魚片、海鮮湯",
  "Wonjo Busan Jokbal": "豬腳、涼拌豬腳",
  "Nampo Seolleongtang": "雪濃湯、餃子",
  "B&C Bakery 南浦": "紅豆麵包、奶油麵包",
  "Songdo 1913": "海景海鮮料理、當日套餐",
  "Thrill on the mug": "咖啡、烘焙甜點",
  "Go Slow Cafe Yeongdo": "海景咖啡、甜點",
};

const shoppingPoints: Point[] = [
  {
    name: "新世界 Centum City",
    category: "購物",
    area: "Centum",
    latitude: 35.16878,
    longitude: 129.12915,
    why_go: "全球大型百貨之一；潮流品牌、精品、美妝與免稅採買集中，炎熱或下雨都適合。",
    google_maps_search: "https://www.google.com/maps/search/?api=1&query=Shinsegae+Centum+City+Busan",
    day: "8/18",
    mustTry: "美妝、設計師品牌、地下美食與伴手禮",
    sourceUrl: "https://www.shinsegae.com/store/main.do?storeCd=SC00007",
    sourceLabel: "新世界 Centum 官方",
    menuUrl: "https://www.google.com/search?tbm=isch&q=Shinsegae+Centum+City+Busan+brands",
  },
  {
    name: "新世界 Centum City 高爾夫專區",
    category: "高爾夫",
    area: "Centum",
    latitude: 35.16878,
    longitude: 129.12915,
    why_go: "以 Centum 百貨內高爾夫服飾、鞋款與配件為主；可和百貨、Spa Land 排在同一段。",
    google_maps_search: "https://www.google.com/maps/search/?api=1&query=Shinsegae+Centum+City+Golf+Busan",
    day: "8/18",
    mustTry: "高爾夫服飾、帽款、鞋款、配件；品牌櫃位依當期樓層指南確認",
    sourceUrl: "https://www.shinsegae.com/store/main.do?storeCd=SC00007",
    sourceLabel: "新世界 Centum 官方",
    menuUrl: "https://www.google.com/search?tbm=isch&q=Shinsegae+Centum+City+golf+brands",
  },
  {
    name: "Golfzon Market 樂天百貨 Centum City",
    category: "高爾夫",
    area: "Centum",
    latitude: 35.1695,
    longitude: 129.132,
    why_go: "球桿、球、手套、鞋與服飾可一次比較；適合想試握球桿或補高爾夫消耗品的人。",
    google_maps_search: "https://www.google.com/maps/search/?api=1&query=Golfzon+Market+Lotte+Centum+City+Busan",
    day: "8/18",
    mustTry: "球桿、手套、球鞋、服飾與配件；先確認可否試打",
    sourceUrl: "https://www.koreatriptips.com/en/shopping/4047635.html",
    sourceLabel: "Korea Trip Tips 店家資料",
    menuUrl: "https://www.google.com/search?tbm=isch&q=Golfzon+Market+Lotte+Centum+City+Busan",
  },
  {
    name: "Adpar Golf Centum",
    category: "高爾夫",
    area: "Centum",
    latitude: 35.176,
    longitude: 129.126,
    why_go: "多品牌高爾夫專門店，球桿與配件較集中，可與 Centum 百貨高爾夫樓層比價。",
    google_maps_search: "https://www.google.com/maps/search/?api=1&query=Adpar+Golf+Centum+Busan",
    day: "8/18",
    mustTry: "多品牌球桿、鞋款、手套與配件",
    sourceUrl: "https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=144005",
    sourceLabel: "VisitKorea 店家資料",
    menuUrl: "https://www.google.com/search?tbm=isch&q=Adpar+Golf+Centum+Busan",
  },
  {
    name: "樂天百貨 釜山本店",
    category: "購物",
    area: "西面",
    latitude: 35.15582,
    longitude: 129.05697,
    why_go: "西面站旁的主力百貨，適合把服飾、美妝、零食與退稅集中處理。",
    google_maps_search: "https://www.google.com/maps/search/?api=1&query=Lotte+Department+Store+Busan+Main",
    day: "8/16",
    mustTry: "韓系服飾、美妝、地下食品館與伴手禮",
    sourceUrl: "https://www.lotteshopping.com/store/main?cstrCd=0001",
    sourceLabel: "樂天百貨官方",
    menuUrl: "https://www.google.com/search?tbm=isch&q=Lotte+Department+Store+Busan+Main+brands",
  },
  {
    name: "樂天百貨 光復店",
    category: "購物",
    area: "南浦",
    latitude: 35.09879,
    longitude: 129.03636,
    why_go: "南浦市場行程可順路加進百貨、免稅與屋頂公園視野。",
    google_maps_search: "https://www.google.com/maps/search/?api=1&query=Lotte+Department+Store+Gwangbok+Busan",
    day: "8/17",
    mustTry: "免稅、美妝、流行服飾與海港景觀",
    sourceUrl: "https://www.lotteshopping.com/store/main?cstrCd=0002",
    sourceLabel: "樂天百貨官方",
    menuUrl: "https://www.google.com/search?tbm=isch&q=Lotte+Department+Store+Gwangbok+Busan+brands",
  },
  {
    name: "西面地下商街",
    category: "潮流服飾",
    area: "西面",
    latitude: 35.15773,
    longitude: 129.05877,
    why_go: "以平價韓系服飾、鞋包、飾品為主，適合熱天與雨天快速逛。",
    google_maps_search: "https://www.google.com/maps/search/?api=1&query=Seomyeon+Underground+Shopping+Center+Busan",
    day: "8/16",
    mustTry: "韓系服飾、包款、飾品、襪子與平價鞋款",
    sourceUrl: "https://www.google.com/search?q=Seomyeon+Underground+Shopping+Center+Busan+Instagram",
    sourceLabel: "社群實拍搜尋",
    menuUrl: "https://www.google.com/search?tbm=isch&q=Seomyeon+Underground+Shopping+Center+Busan",
  },
  {
    name: "田浦咖啡街選物區",
    category: "潮流服飾",
    area: "田浦",
    latitude: 35.15482,
    longitude: 129.06352,
    why_go: "獨立選物、二手與設計感店鋪分散在咖啡街巷弄，適合慢逛並以當日營業為準。",
    google_maps_search: "https://www.google.com/maps/search/?api=1&query=Jeonpo+Cafe+Street+Busan",
    day: "8/16",
    mustTry: "獨立選物、二手服飾、香氛、設計小物",
    sourceUrl: "https://www.google.com/search?q=Jeonpo+Busan+select+shop+Instagram",
    sourceLabel: "社群實拍搜尋",
    menuUrl: "https://www.google.com/search?tbm=isch&q=Jeonpo+Busan+select+shop",
  },
  {
    name: "西面年輕人街",
    category: "潮流服飾",
    area: "西面",
    latitude: 35.157,
    longitude: 129.059,
    why_go: "西面站附近的年輕人商圈，平價韓系服飾、球鞋、美妝與飾品密度高。",
    google_maps_search: "https://www.google.com/maps/search/?api=1&query=Seomyeon+Fashion+Street+Busan",
    day: "8/16",
    mustTry: "SPA 品牌、韓國平價服飾、球鞋與美妝",
    sourceUrl: "https://www.google.com/search?q=Seomyeon+Fashion+Street+Busan+Instagram",
    sourceLabel: "社群實拍搜尋",
    menuUrl: "https://www.google.com/search?tbm=isch&q=Seomyeon+Fashion+Street+Busan",
  },
  {
    name: "田浦工具街",
    category: "潮流服飾",
    area: "田浦",
    latitude: 35.152,
    longitude: 129.067,
    why_go: "工業街轉型成選物與設計店街區，適合找文具、家居、獨立服飾與不撞款小物。",
    google_maps_search: "https://www.google.com/maps/search/?api=1&query=Jeonpo+Tool+Road+Busan",
    day: "8/16",
    mustTry: "生活選物、文具、家居與獨立設計品牌",
    sourceUrl: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?dataSetId=120&menuSn=929&vcontsId=1590968",
    sourceLabel: "VisitKorea 田浦介紹",
    menuUrl: "https://www.google.com/search?tbm=isch&q=Jeonpo+Tool+Road+Busan+shops",
  },
  {
    name: "Shinsegae Simon Busan Premium Outlet",
    category: "Outlet",
    area: "機張",
    latitude: 35.319,
    longitude: 129.242,
    why_go: "第二個大型 Outlet 選擇，服飾、精品、戶外與 Golf 品牌較集中，適合特別想比折扣時排半日。",
    google_maps_search: "https://www.google.com/maps/search/?api=1&query=Shinsegae+Simon+Busan+Premium+Outlet",
    day: "8/15",
    mustTry: "運動、戶外、Golf 與精品品牌；先看當期品牌地圖",
    sourceUrl: "https://www.premiumoutlets.co.kr/assets/attach/download/store/3/map",
    sourceLabel: "Outlet 官方品牌地圖",
    menuUrl: "https://www.google.com/search?tbm=isch&q=Shinsegae+Simon+Busan+Premium+Outlet+brands",
  },
  {
    name: "機張市場",
    category: "購物",
    area: "機張",
    latitude: 35.2448,
    longitude: 129.2137,
    why_go: "海苔、海產乾貨、蟹類與地方調味品，想買有釜山感的伴手禮可加進龍宮寺或 Outlet 動線。",
    google_maps_search: "https://www.google.com/maps/search/?api=1&query=Gijang+Market+Busan",
    day: "8/15",
    mustTry: "海苔、海產乾貨、蟹類與海鮮調味品",
    sourceUrl: "https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301003001000&uc_seq=292",
    sourceLabel: "Visit Busan 市場介紹",
    menuUrl: "https://www.google.com/search?tbm=isch&q=Gijang+Market+Busan+food",
  },
  {
    name: "南浦洞時裝街",
    category: "潮流服飾",
    area: "南浦",
    latitude: 35.0985,
    longitude: 129.03,
    why_go: "市場行程可順逛的平價服飾、球鞋、帽子與飾品街，價格帶通常低於百貨。",
    google_maps_search: "https://www.google.com/maps/search/?api=1&query=Nampodong+Fashion+Street+Busan",
    day: "8/17",
    mustTry: "韓系平價服飾、球鞋、帽子、飾品",
    sourceUrl: "https://www.google.com/search?q=Nampodong+Fashion+Street+Busan+Instagram",
    sourceLabel: "社群實拍搜尋",
    menuUrl: "https://www.google.com/search?tbm=isch&q=Nampodong+Fashion+Street+Busan",
  },
];

const extraPoints = shoppingPoints;

function parseCsv(text: string): LegacyPoint[] {
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') { cell += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = []; cell = "";
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const headers = rows.shift() ?? [];
  return rows.map((values) => {
    const item = Object.fromEntries(headers.map((header, index) => [header.replace(/^\uFEFF/, ""), values[index] ?? ""]));
    return { name: item.name, category: item.category, area: item.area, latitude: Number(item.latitude), longitude: Number(item.longitude), why_go: item.why_go, google_maps_search: item.google_maps_search, stay_priority: item.stay_priority };
  });
}

function suggestedDay(area: string) {
  if (/海雲台|海理團|松亭|青沙浦/.test(area)) return "8/14";
  if (/機張/.test(area)) return "8/15";
  if (/西面|田浦/.test(area)) return "8/16";
  if (/南浦|甘川|松島|影島|多大浦/.test(area)) return "8/17";
  return "8/18";
}

function menuSearch(name: string) {
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${name} Busan menu food`)}`;
}

function createBrief(point: Point) {
  const isFood = point.category === "餐廳" || point.category === "小吃" || point.category === "咖啡";
  const action = isFood
    ? `點餐重點是「${point.mustTry}」；多人同行可先分食一份招牌，再依口味追加。`
    : `逛法重點是「${point.mustTry}」；建議先收藏 Google Maps 位置，再依當天體力與天氣調整停留時間。`;
  const review = point.sourceLabel.includes("官方") || point.sourceLabel.includes("Michelin")
    ? `網路資料以${point.sourceLabel}為主要依據，適合當作第一順位候選。`
    : "網路推薦較偏向社群與地圖口碑，營業時間、候位與當期店況請在出發前再次確認。";
  return `${point.name}位於${point.area}，${point.why_go}。${action}${review}這一站適合排在${point.day}，並可與同區地點串成半日路線。`;
}

function socialSearch(name: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(`${name} Busan Instagram Naver Map`)}`;
}

const mapFixes: Record<string, Partial<Point>> = {
  "Lotte Premium Outlet 東釜山": {
    category: "Outlet", latitude: 35.1958, longitude: 129.2125, day: "8/15",
    sourceUrl: "https://www.premiumoutlets.co.kr/webcontents/centermap_busan_ko.pdf", sourceLabel: "Outlet 官方品牌地圖",
  },
  "新世界 Centum City / Spa Land": { latitude: 35.169, longitude: 129.129, day: "8/18" },
  "海雲台藍線公園 尾浦站": { latitude: 35.1602, longitude: 129.171, day: "8/15" },
  "Gamcheon Culture Village": { latitude: 35.0975, longitude: 129.0106, day: "8/17" },
  "Songdo Marine Cable Car": { latitude: 35.0765, longitude: 129.0208, day: "8/17" },
  "Huinnyeoul Culture Village": { latitude: 35.0792, longitude: 129.0442, day: "8/17" },
};

function enrichPoint(point: LegacyPoint): Point {
  const verified = verifiedSources[point.name];
  const suggested = foodNotes[point.name] ?? (point.category === "餐廳" ? "店內招牌套餐與當日小菜" : point.category === "小吃" ? "店內招牌與當日現做品項" : point.why_go);
  const enriched: Point = {
    ...point,
    day: suggestedDay(point.area),
    mustTry: verified?.mustTry ?? suggested,
    sourceUrl: verified?.url ?? socialSearch(point.name),
    sourceLabel: verified?.label ?? "社群／地圖參考搜尋",
    menuUrl: menuSearch(point.name),
  };
  return { ...enriched, ...mapFixes[point.name] };
}

function categoryClass(category: string) { return `cat-${category}`; }

function markerColor(category: string) {
  return ({ 景點: "#1f7a8c", 餐廳: "#d75f45", 小吃: "#c88a2b", 咖啡: "#37624b", 購物: "#7f557d", 潮流服飾: "#7f557d", 高爾夫: "#4f719c", Outlet: "#9d5e30", 雨備: "#596b9b" } as Record<string, string>)[category] ?? "#17201d";
}

function googleMapsEmbed(point: Point) {
  return `https://www.google.com/maps?q=${encodeURIComponent(`${point.name} ${point.area} Busan`)}&z=16&output=embed`;
}

export function TripMap() {
  const [points, setPoints] = useState<Point[]>([]);
  const [selectedName, setSelectedName] = useState("");
  const [category, setCategory] = useState("全部");
  const [day, setDay] = useState("全部");
  const [query, setQuery] = useState("");
  const [onlySaved, setOnlySaved] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [leafletReady, setLeafletReady] = useState(false);
  const leafletNode = useRef<HTMLDivElement | null>(null);
  const leafletMap = useRef<any>(null);
  const leafletMarkers = useRef<any[]>([]);

  useEffect(() => {
    fetch("/busan-points.csv").then((response) => response.text()).then((text) => {
      const loaded = parseCsv(text).map(enrichPoint);
      const merged = [...loaded, ...extraPoints].map((point) => ({ ...point, brief: createBrief(point) }));
      setPoints(merged);
      setSelectedName(merged[0]?.name ?? "");
    });
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem("busan-trip-saved");
    if (stored) setSaved(JSON.parse(stored));
  }, []);
  useEffect(() => { window.localStorage.setItem("busan-trip-saved", JSON.stringify(saved)); }, [saved]);

  useEffect(() => {
    if (window.L) { setLeafletReady(true); return; }
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    style.id = "leaflet-style";
    if (!document.getElementById(style.id)) document.head.appendChild(style);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.id = "leaflet-script";
    script.async = true;
    script.onload = () => setLeafletReady(Boolean(window.L));
    if (!document.getElementById(script.id)) document.head.appendChild(script);
  }, []);

  const filtered = useMemo(() => points.filter((point) => {
    const categoryMatch = category === "全部" || point.category === category;
    const dayMatch = day === "全部" || point.day === day;
    const queryMatch = !query.trim() || `${point.name} ${point.area} ${point.why_go} ${point.mustTry}`.toLowerCase().includes(query.trim().toLowerCase());
    return categoryMatch && dayMatch && queryMatch && (!onlySaved || saved.includes(point.name));
  }), [category, day, onlySaved, points, query, saved]);

  const selected = useMemo(() => points.find((point) => point.name === selectedName) ?? filtered[0] ?? points[0], [filtered, points, selectedName]);

  useEffect(() => { if (selected && !filtered.some((point) => point.name === selected.name)) setSelectedName(filtered[0]?.name ?? ""); }, [filtered, selected]);

  useEffect(() => {
    if (!leafletReady || !window.L || !leafletNode.current || !selected) return;
    const L = window.L;
    if (!leafletMap.current) {
      leafletMap.current = L.map(leafletNode.current, { zoomControl: true, scrollWheelZoom: true }).setView([35.137, 129.075], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap contributors" }).addTo(leafletMap.current);
    }
    leafletMarkers.current.forEach((marker) => marker.remove());
    leafletMarkers.current = filtered.map((point) => {
      const marker = L.circleMarker([point.latitude, point.longitude], { radius: point.name === selected.name ? 9 : 6, color: "#fffaf0", weight: 2, fillColor: markerColor(point.category), fillOpacity: 0.95 }).addTo(leafletMap.current);
      marker.bindTooltip(`<strong>${point.name}</strong><br/>${point.category} · ${point.area}`);
      marker.on("click", () => setSelectedName(point.name));
      return marker;
    });
    if (filtered.length > 1) leafletMap.current.fitBounds(L.latLngBounds(filtered.map((point) => [point.latitude, point.longitude])), { padding: [32, 32], maxZoom: 13 });
    else if (filtered[0]) leafletMap.current.setView([filtered[0].latitude, filtered[0].longitude], 15);
  }, [filtered, leafletReady, selected]);

  const toggleSaved = (name: string) => setSaved((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Busan group map · 2026/8/14-8/18</p>
          <h1>釜山旅伴共用地圖</h1>
          <p>景點、美食、Outlet、韓國潮流服飾與高爾夫用品全部放進同一張可點選地圖。每一點都附精確座標、Google Maps、參考來源與菜單／實拍入口。</p>
        </div>
        <div className="hero-facts" aria-label="行程摘要">
          <div><span>{points.length || "..."}</span><small>精選候選點</small></div>
          <div><span>3</span><small>購物主題</small></div>
          <div><span>8/15</span><small>連假人潮高峰</small></div>
        </div>
      </section>

      <section className="route-strip" aria-label="每日建議路線">
        {routeDays.map((item) => <button key={item.day} type="button" onClick={() => setDay(item.day)} className={day === item.day ? "route-active" : ""}><strong>{item.day}</strong><span>{item.theme}</span><p>{item.plan}</p></button>)}
      </section>

      <section className="control-panel" aria-label="篩選工具">
        <label><span>建議日期</span><select value={day} onChange={(event) => setDay(event.target.value)}>{days.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>類型</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="search-field"><span>搜尋</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如：高爾夫、Outlet、糖餅、雨備" /></label>
        <label className="check-field"><input type="checkbox" checked={onlySaved} onChange={(event) => setOnlySaved(event.target.checked)} /><span>只看旅伴收藏</span></label>
      </section>

      <section className="map-layout">
        <div className="map-card">
          <div className="section-head"><div><p className="eyebrow">Interactive map</p><h2>{filtered.length} 個目前符合的地點</h2></div><div className="legend">{categories.slice(1).map((item) => <span key={item} className={categoryClass(item)}>{item}</span>)}</div></div>
          <div ref={leafletNode} className="leaflet-map" aria-label="釜山地點互動地圖" />
          <p className="map-note">點選地圖標記或下方卡片後，右側會更新精確 Google Maps 位置、參考連結與菜單／實拍。</p>
        </div>

        <aside className="place-panel">
          {selected ? <>
            <div className="place-head"><span className={`pill ${categoryClass(selected.category)}`}>{selected.category}</span><button type="button" onClick={() => toggleSaved(selected.name)}>{saved.includes(selected.name) ? "已收藏" : "加入收藏"}</button></div>
            <h2>{selected.name}</h2><p className="place-brief">{selected.brief}</p>
            <dl><div><dt>分區</dt><dd>{selected.area}</dd></div><div><dt>建議安排</dt><dd>{selected.day}</dd></div><div><dt>推薦重點</dt><dd>{selected.mustTry}</dd></div><div><dt>精確座標</dt><dd>{selected.latitude.toFixed(5)}, {selected.longitude.toFixed(5)}</dd></div></dl>
            <div className="embed-wrap"><iframe key={selected.name} title={`${selected.name} Google Maps`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={googleMapsEmbed(selected)} /></div>
            <div className="place-actions three-actions">
              <a href={selected.google_maps_search} target="_blank" rel="noreferrer">Google Maps</a>
              <a href={selected.sourceUrl} target="_blank" rel="noreferrer">{selected.sourceLabel}</a>
              <a href={selected.menuUrl} target="_blank" rel="noreferrer">菜單／實拍</a>
            </div>
          </> : <p>正在載入點位資料。</p>}
        </aside>
      </section>

      <section className="list-section">
        <div className="section-head"><div><p className="eyebrow">Shared shortlist</p><h2>旅伴一起看的候選清單</h2></div><p>{saved.length} 個已收藏</p></div>
        <div className="place-grid">{filtered.map((point) => <article key={point.name} className={point.name === selected?.name ? "active-card" : ""} onClick={() => setSelectedName(point.name)}><div><span className={`pill ${categoryClass(point.category)}`}>{point.category}</span><button type="button" onClick={(event) => { event.stopPropagation(); toggleSaved(point.name); }}>{saved.includes(point.name) ? "收藏中" : "收藏"}</button></div><h3>{point.name}</h3><p>{point.brief}</p><footer><span>{point.area}</span><span>{point.day}</span></footer></article>)}</div>
      </section>
    </main>
  );
}

