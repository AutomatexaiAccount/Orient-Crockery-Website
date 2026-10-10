const fs = require('fs');
const path = require('path');

const rawMeyer = `
1 Meyer Trivantage Deep Kadai 20cm - 2.3L w/Lid 32118-N 3675/- (00008284) Deep Kadai
2 Meyer Trivantage Deep Kadai 24cm - 3.6L w/Lid 32119-N 4375/- (00008285) Deep Kadai
3 Meyer Trivantage Pro Kadai 18cm - 1.4L w/Lid 32111-N 3175/- (00008278) SS Kadai
4 Meyer Trivantage Pro Kadai 20cm - 1.8L w/Lid 32112-N 3475/- (00008279) SS Kadai
5 Meyer Trivantage Pro Kadai 22cm - 2.0L w/Lid 32113-N 3675/- (00008280) SS Kadai
6 Meyer Trivantage Pro Kadai 24cm - 2.9L w/Lid 32114-N 4075/- (00008281) SS Kadai
7 Meyer Trivantage Pro Kadai 26cm - 3.8L w/Lid 32115-N 4475/- (00008282) SS Kadai
8 Meyer Trivantage Pro Kadai 28cm - 4.4L w/Lid 32116-N 4775/- (00008283) SS Kadai
9 Meyer Trivantage Pro Sauce Pan 16cm - 1.7L w/Lid 32107-N 3275/- (00008290) SS Sauce Pan
10 Meyer Trivantage Pro Sauce Pan 18cm - 2.4L w/Lid 32121-N 3675/- (00008291) SS Sauce Pan
11 Meyer Trivantage Pro SS Fry Pan 20cm 32102-N 2475/- (00008286) SS Fry Pan
12 Meyer Trivantage Pro SS Fry Pan 22cm 32103-N 2775/- (00008287) SS Fry Pan
13 Meyer Trivantage Pro SS Fry Pan 24cm 32104-N 3075/- (00008288) SS Fry Pan
14 Meyer Trivantage Pro SS Fry Pan 26cm 32105-N 3375/- (00008289) SS Fry Pan
`;

const rawStahl = `
1 Stahl Biryani Handi with Lid 24cm 4184 4380/- (00007674) Biryani Handi
2 Stahl Biryani Handi with Lid 28cm 4188 5880/- (00007675) Biryani Handi
3 Stahl Biryani Handi with Lid 32cm 4192 7080/- (00007676) Biryani Handi
4 Stahl Cast Iron Blacksmith Dosa Tawa 30cm 7930 (00007611) Cast Iron Dosa Tawa
5 Stahl Cast Iron Blacksmith Dosa Tawa 28cm 7928 (00007610) Cast Iron Dosa Tawa
6 Stahl Cast Iron Blacksmith Roti Tawa 26 cm 7966 (00007280) Cast Iron Roti Tawa
7 Stahl T/Ply Pressure Cooker DUO 2.5L+3L Tall (9249) (00007607) Cooker Combo
8 Stahl T/Ply Pressure Cooker DUO 3L+5L Tall (9259) (00008012) Cooker Combo
9 Stahl Cooking Pot SS with GL 14cm 1L 4114 2880/- (00006471) Cooking Pot
10 Stahl Cooking Pot SS with GL 16cm 1.4L 4116 2980/- (00001168) Cooking Pot
11 Stahl Cooking Pot SS with GL 18cm 2L 4118 3480/- (00001167) Cooking Pot
12 Stahl Cooking Pot SS with GL 20cm 2.8L 4120 3680/- (00001166) Cooking Pot
13 Stahl Cooking Pot SS with GL 22cm 3.8L 4122 4180/- (00001165) Cooking Pot
14 Stahl Cooking Pot SS with GL 24cm 5.1L 4124 4380/- (00001164) Cooking Pot
15 Stahl Cooking Pot SS with GL 26cm 6L 4126 5480/- (00007413) Cooking Pot
16 Stahl Cooking Pot SS with GL 28cm 7.2L 4128 5780/- (00007414) Cooking Pot
17 Stahl Cooking Pot SS with GL 32cm 12.2L 4132 6980/- (00005942) Cooking Pot
18 Stahl Artisan Hybrid Tawa 28cm 6928 3780/- (00005415) Hybrid Dosa Tawa
19 Stahl Artisn Hybrid Tawa 30cm 6930 3980/- (00007415) Hybrid Dosa Tawa
20 Stahl Artisn Hybrid Tawa 32cm 6932 4280/- (00004810) Hybrid Dosa Tawa
21 Stahl Hybrid Dosa Tawa 28 cm 6978 3880/- (00007029) Hybrid Dosa Tawa Rimless
22 Stahl Hybrid Dosa Tawa 30cm 6980 4080/- (00007523) Hybrid Dosa Tawa Rimless
23 Stahl Hybrid Fry Pan 16cm 6436 3380/- (00006316) Hybrid Frypan
24 Stahl Hybrid Fry Pan 18 Cm 6438 3480/- (00005036) Hybrid Frypan
25 Stahl Hybrid Fry Pan 20cm 6420 3980/- (00006714) Hybrid Frypan
26 Stahl Hybrid Fry pan 22 CM 6422 4280/- (00007231) Hybrid Frypan
27 Stahl Hybrid Fry Pan 24cm 6424 4480/- (00006383) Hybrid Frypan
28 Stahl Hybrid Fry pan 26 CM 6426 4680/- (00006670) Hybrid Frypan
29 Stahl Hybrid Fry pan 28 CM 6428 4880/- (00006671) Hybrid Frypan
30 Stahl Artisan Hybrid Kadai 18cm 6318 3980/- (00006503) Hybrid Kadhai
31 Stahl Artisan Hybrid Kadai 20cm 6320 4180/- (00005037) Hybrid Kadhai
32 Stahl Artisan Hybrid Kadai 22cm 6322 4380/- (00004342) Hybrid Kadhai
33 Stahl Artisan Hybrid Kadai 24 Cm 6324 4580/- (00005038) Hybrid Kadhai
34 Stahl Artisan Hybrid Kadai 26 Cm 6326 4880/- (00005039) Hybrid Kadhai
35 Stahl Artisan Hybrid Kadai 28 cm 6328 5180/- (00006474) Hybrid Kadhai
36 Stahl Hybrid Kadai 30cm with Lid 6330 5580/- (00006890) Hybrid Kadhai
37 Stahl Hybrid Roti Tawa 22cm 6962 3380/- (00007513) Hybrid Roti Tawa
38 Stahl Hybrid Roti Tawa 26cm 6966 3380/- (00007514) Hybrid Roti Tawa
39 Stahl Hybrid Deep Fry Pan W/Lid 22cm 6722 4380/- (00007831) Hybrid Wok
40 Stahl Hybrid Deep Fry Pan W/Lid 26cm 6726 (00007832) Hybrid Wok
41 Stahl Knife Sharpener 2 Stage 9699 580/- (00007281) Knives
42 Stahl Talton Bread Knife 8Inch 109612 1999/- (00007703) Knives
43 Stahl Talton Paring Knife 3.5Inch 109616 1299/- (00007699) Knives
44 Stahl Talton Santoku Knife 5Inch 109613 1799/- (00007702) Knives
45 Stahl Talton Tomato Knife 5Inch 109615 1399/- (00007700) Knives
46 Stahl Talton Utility Knife 5Inch 109614 1399/- (00007701) Knives
47 Stahl Mikro Fry Pan 12cm 4410 (00007411) Mikro
48 Stahl Mikro Saucepan 10cm (00007425) Mikro
49 Stahl Commercial TriPly P. Cooker Broad 10 L 9290 8080/- (00008000) Pressure Cooker
50 Stahl Commercial TriPly P. Cooker Broad 8 L 9288 7580/- (00008013) Pressure Cooker
51 Stahl Xpress TriPly P. Cooker Baby 1.5 L 9265 3580/- (00006375) Pressure Cooker
52 Stahl Xpress TriPly P. Cooker Baby 1 L 9261 3380/- (00001172) Pressure Cooker
53 Stahl Xpress TriPly P. Cooker Belly 3 L 9273 4180/- (00005150) Pressure Cooker
54 Stahl Xpress TriPly P. Cooker Belly 5 L 9275 5180/- (00005149) Pressure Cooker
55 Stahl Xpress TriPly P. Cooker Broad 2.5 L 9242 3980/- (00001171) Pressure Cooker
56 Stahl Xpress TriPly P. Cooker Broad 5 L 9215 5080/- (00001169) Pressure Cooker
57 Stahl Xpress TriPly P. Cooker Broad 6 L 9226 5080/- (00007449) Pressure Cooker
58 Stahl Xpress TriPly P. Cooker Broad 8 L 9218 6080/- (00007609) Pressure Cooker
59 Stahl Xpress TriPly P. Cooker Tall 3 L 9243 4280/- (00001170) Pressure Cooker
60 Stahl Sauce Pan 14 cm 4214 2780/- (00006475) Sauce Pan
61 Stahl Sauce Pan 16 cm 4216 2980/- (00005950) Sauce Pan
62 Stahl Sauce Pan 18 cm 4218 3480/- (00002000) Sauce Pan
63 Stahl Sauce Pan 20 cm 4220 3880/- (00006506) Sauce Pan
64 Stahl Sauce Pan with Stainer 14 cm 4244 2980/- (00007927) Sauce Pan with Strainer
65 Stahl Sauce Pan with Stainer Lid 16 cm 4246 3180/- (00007128) Sauce Pan with Strainer
66 Stahl Sauce Pan with Stainer Lid 18 cm 4248 3480/- (00007129) Sauce Pan with Strainer
67 Stahl-Schild Dosa Tawa 28cm3958 4180/- (00007672) Schild Dosa Tawa
68 Stahl-Schild Dosa Tawa 30cm 3960 4380/- (00007673) Schild Dosa Tawa
69 Stahl-Schild Dosa Tawa 32cm 3932 4780/- (00008134) Schild Dosa Tawa
70 Stahl -Schild Frypan with GL 20cm 3450 4280/- (00007929) Schild Fry Pan
71 Stahl -Schild Frypan with GL 24cm 3454 4880/- (00007671) Schild Fry Pan
72 Stahl -Schild Fry Pan with GL 26cm 3456 5180/- (00007965) Schild Fry Pan
73 Stahl - Schild Frypan with GL 28cm 3458 5580/- (00008126) Schild Fry Pan
74 Stahl -Schild Kadai with GL 20cm 3350 4480/- (00007964) Schild Kadhai
75 Stahl -Schild Kadai with GL 22cm 3352 4680/- (00008127) Schild Kadhai
76 Stahl -Schild Kadai with GL 24cm 3354 4980/- (00007668) Schild Kadhai
77 Stahl -Schild Kadai with GL 26cm 3356 5380/- (00007669) Schild Kadhai
78 Stahl - Schild Kadai with GL 28cm 3358 5780/- (00007973) Schild Kadhai
79 Stahl - Schild Paniyaram Pan 26cm 12 Pits 3886 5480/- (00008062) Schild Paniyaram 
80 Stahl-Schild Roti Tawa 26cm 103966 3980/- (00007942) Schild Roti Tawa
81 Stahl SS Fry Pan 16 cm 4436 2180/- (00003645) SS Fry Pan
82 Stahl SS Fry Pan 22 cm 4422 3280/- (00003646) SS Fry Pan
83 Stahl SS Frypan 26cm 4426 3680/- (00006891) SS Fry Pan
84 Stahl SS Frypan 28cm 4428 3880/- (00006892) SS Fry Pan
85 Stahl SS Kadai No16 4316 2580/- (00001158) SS Kadhai
86 Stahl SS Kadai No18 4318 2880/- (00001159) SS Kadhai
87 Stahl SS Kadai No20 4320 3080/- (00001157) SS Kadhai
88 Stahl SS Kadai No.22 4322 3380/- (00001156) SS Kadhai
89 Stahl SS Kadai No24 4324 3680/- (00001162) SS Kadhai
90 Stahl SS Kadai No26 4326 3980/- (00001161) SS Kadhai
91 Stahl SS Kadai No.28 4328 4280/- (00001160) SS Kadhai
92 Stahl SS Kadai No.30 4330 4580/- (00001163) SS Kadhai
93 Stahl SS Kadai No.32 4332 5480/- (00007365) SS Kadhai
94 Stahl SS Kadai No.34 4334 6280/- (00006888) SS Kadhai
95 Stahl SS Kadai No.40 4340 6980/- (00006889) SS Kadhai
96 Stahl Tadka Pan 10 cm 4294 1080/- (00006609) Tadka Pan
97 Stahl Tadka Pan 12cm 4295 1280/- (00007524) Tadka Pan
98 Stahl Tadka Pan 8 cm 4293 980/- (00006608) Tadka Pan
99 Stahl SS Tope 16 4516 1980/- (00001793) Tope
100 Stahl SS Tope 18 4518 2380/- (00001794) Tope
101 Stahl SS Tope 20 4520 2680/- (00001795) Tope
102 Stahl SS Tope 24 4524 3380/- (00004327) Tope
103 Stahl SS Tope 28 4528 4580/- (00005164) Tope
104 Stahl SS Tope 32 12 LTR 4532 5680/- (00007894) Tope
105 Stahl SS Pres. Cooker Versatil 3LTR 9413 (00004871) Versatil Cooker
106 Stahl SS Pressure Cooker Versatil 5L 9415 8580/- Versatil Cooker
107 Stahl SS Deep Fry Pan 22 cm 4722 3380/- (00007416) Wok
108 Stahl -SS Deep Fry Pan 24cm 4724 3780/- (00007426) Wok
109 Stahl -SS Deep Fry Pan 26cm 4726 4080/- (00007110) Wok
`;

function parseLines(raw, baseId, brand, department) {
  const lines = raw.trim().split('\n');
  const products = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const numMatch = line.match(/^(\d+)/);
    if (!numMatch) continue;
    const num = parseInt(numMatch[1]);
    const id = baseId + num;

    let text = line.replace(/^\d+\s+/, "");

    // Match format: [Name] [Price]/- [(Barcode)] [Category]
    // Price is always followed by /-
    const priceMatch = text.match(/(\d+)\/-/);
    let price = 999;
    if (priceMatch) {
      price = parseInt(priceMatch[1]);
      text = text.replace(priceMatch[0], "");
    }

    // Match barcode: (00007965)
    const barcodeMatch = text.match(/\((\d{8})\)/);
    if (barcodeMatch) {
      text = text.replace(barcodeMatch[0], "");
    }

    // After removing price and barcode, the string is usually: [Name] [Category]
    // Or sometimes category is just at the end.
    // Let's just use the whole remaining text as name and clean it up.
    let name = text.trim();
    let category = "General";
    
    // We can extract category based on the known categories or just leave it.
    // Let's use the folder names if possible, but it's okay to just use the name for now.
    // Clean up random numbers like 3456 or 103966 from the name
    name = name.replace(/\b\d{4,6}\b/g, "").replace(/\s+/g, " ").trim();
    
    // Set a generic category based on name keywords
    if (name.toLowerCase().includes("kadai")) category = "Kadai";
    else if (name.toLowerCase().includes("fry pan") || name.toLowerCase().includes("frypan")) category = "Fry Pan";
    else if (name.toLowerCase().includes("dosa tawa") || name.toLowerCase().includes("roti tawa")) category = "Tawa";
    else if (name.toLowerCase().includes("sauce pan")) category = "Sauce Pan";
    else if (name.toLowerCase().includes("cooker")) category = "Pressure Cooker";
    else if (name.toLowerCase().includes("handi")) category = "Handi";
    else if (name.toLowerCase().includes("knife")) category = "Knives";
    
    const imageUrl = `https://rppakudcmvwlkcxjhnfn.supabase.co/storage/v1/object/public/products/${id}.png`;

    products.push({
      id: id,
      name: name,
      price: price,
      stock: Math.floor(Math.random() * 40) + 10,
      department: department,
      category: category,
      subCategory: "",
      fragile: false,
      microwave: false,
      hsn: "73239390",
      gst: 12,
      description: `Premium ${brand} ${category}. Highly durable and beautifully designed for modern kitchens.`,
      image: imageUrl
    });
  }
  return products;
}

const allProducts = [
  ...parseLines(rawMeyer, 400, "Meyer", "Cookware"),
  ...parseLines(rawStahl, 500, "Stahl", "Cookware")
];

const header = "id,name,price,stock,department,category,subCategory,fragile,microwave,hsn,gst,description,image\n";
const csvRows = allProducts.map(p => {
  return `${p.id},"${p.name}",${p.price},${p.stock},"${p.department}","${p.category}","${p.subCategory}",${p.fragile},${p.microwave},"${p.hsn}",${p.gst},"${p.description}","${p.image}"`;
});

const csvContent = header + csvRows.join("\n");
fs.writeFileSync(path.join(__dirname, 'NEW_PRODUCTS_IMPORT.csv'), csvContent);
console.log("Created NEW_PRODUCTS_IMPORT.csv with " + allProducts.length + " products!");
