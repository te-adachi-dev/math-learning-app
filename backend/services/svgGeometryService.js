// backend/services/svgGeometryService.js (新規作成)

class SVGGeometryService {
  // 図形問題用のSVG生成
  static generateGeometryProblem(grade, unitName) {
    const problems = {
      2: {
        '図形（はこの形）': this.generateShapeIdentification(),
      },
      4: {
        '図形（四角形）': this.generateRectangleProblem(),
        '測定（面積）': this.generateAreaProblem(),
        '角度': this.generateAngleProblem(),
      },
      5: {
        '図形（円と正多角形）': this.generateCircleProblem(),
      },
      6: {
        '図形（拡大図と縮図）': this.generateScaleProblem(),
        '測定（円の面積）': this.generateCircleAreaProblem(),
      }
    };

    return problems[grade]?.[unitName] || null;
  }

  // 形の識別問題（2年生用）
  static generateShapeIdentification() {
    const shapes = ['正方形', '長方形', '三角形', '円'];
    const selectedShape = shapes[Math.floor(Math.random() * shapes.length)];
    
    let svg = '';
    let answer = '';
    
    switch(selectedShape) {
      case '正方形':
        svg = `
          <svg width="300" height="200" viewBox="0 0 300 200">
            <rect x="100" y="50" width="100" height="100" 
                  fill="lightblue" stroke="black" stroke-width="2"/>
            <text x="150" y="180" font-size="14" font-family="Arial" text-anchor="middle">この形の名前は？</text>
          </svg>
        `;
        answer = '正方形';
        break;
      case '長方形':
        svg = `
          <svg width="300" height="200" viewBox="0 0 300 200">
            <rect x="75" y="60" width="150" height="80" 
                  fill="lightgreen" stroke="black" stroke-width="2"/>
            <text x="150" y="180" font-size="14" font-family="Arial" text-anchor="middle">この形の名前は？</text>
          </svg>
        `;
        answer = '長方形';
        break;
      case '三角形':
        svg = `
          <svg width="300" height="200" viewBox="0 0 300 200">
            <polygon points="150,50 100,140 200,140" 
                     fill="lightyellow" stroke="black" stroke-width="2"/>
            <text x="150" y="180" font-size="14" font-family="Arial" text-anchor="middle">この形の名前は？</text>
          </svg>
        `;
        answer = '三角形';
        break;
      case '円':
        svg = `
          <svg width="300" height="200" viewBox="0 0 300 200">
            <circle cx="150" cy="95" r="50" 
                    fill="lightcoral" stroke="black" stroke-width="2"/>
            <text x="150" y="180" font-size="14" font-family="Arial" text-anchor="middle">この形の名前は？</text>
          </svg>
        `;
        answer = '円';
        break;
    }

    return {
      problem: `下の図形の名前を答えましょう。`,
      svg: svg,
      answer: answer,
      explanation: `この図形は${answer}です。${answer}の特徴を覚えておきましょう。`
    };
  }

  // 長方形の面積問題
  static generateAreaProblem() {
    const width = Math.floor(Math.random() * 8) + 3; // 3-10
    const height = Math.floor(Math.random() * 6) + 2; // 2-7
    
    const svg = `
      <svg width="300" height="200" viewBox="0 0 300 200">
        <rect x="50" y="50" width="${width * 20}" height="${height * 20}" 
              fill="lightblue" stroke="black" stroke-width="2"/>
        <text x="60" y="45" font-size="14" font-family="Arial">${width}cm</text>
        <text x="20" y="70" font-size="14" font-family="Arial">${height}cm</text>
        <!-- 寸法線 -->
        <line x1="50" y1="40" x2="${50 + width * 20}" y2="40" stroke="black" stroke-width="1"/>
        <line x1="50" y1="35" x2="50" y2="45" stroke="black" stroke-width="1"/>
        <line x1="${50 + width * 20}" y1="35" x2="${50 + width * 20}" y2="45" stroke="black" stroke-width="1"/>
        
        <line x1="35" y1="50" x2="35" y2="${50 + height * 20}" stroke="black" stroke-width="1"/>
        <line x1="30" y1="50" x2="40" y2="50" stroke="black" stroke-width="1"/>
        <line x1="30" y1="${50 + height * 20}" x2="40" y2="${50 + height * 20}" stroke="black" stroke-width="1"/>
      </svg>
    `;

    return {
      problem: `下の長方形の面積を求めましょう。`,
      svg: svg,
      answer: `${width * height}㎠`,
      explanation: `長方形の面積は たて × よこ で求められます。${height} × ${width} = ${width * height}㎠です。`
    };
  }

  // 角度問題
  static generateAngleProblem() {
    const angle = [30, 45, 60, 90, 120][Math.floor(Math.random() * 5)];
    const angleRad = (angle * Math.PI) / 180;
    
    const svg = `
      <svg width="300" height="200" viewBox="0 0 300 200">
        <line x1="100" y1="100" x2="200" y2="100" stroke="black" stroke-width="2"/>
        <line x1="100" y1="100" x2="${100 + 80 * Math.cos(angleRad)}" y2="${100 - 80 * Math.sin(angleRad)}" stroke="black" stroke-width="2"/>
        <path d="M 120 100 A 20 20 0 0 0 ${100 + 20 * Math.cos(angleRad)} ${100 - 20 * Math.sin(angleRad)}" 
              fill="none" stroke="red" stroke-width="2"/>
        <text x="125" y="95" font-size="12" font-family="Arial" fill="red">?</text>
        <text x="210" y="105" font-size="14" font-family="Arial">→</text>
      </svg>
    `;

    return {
      problem: `この角度は何度ですか？`,
      svg: svg,
      answer: `${angle}度`,
      explanation: `この角度は${angle}度です。${angle === 90 ? '直角' : angle < 90 ? '鋭角' : '鈍角'}ですね。`
    };
  }

  // 円の面積問題
  static generateCircleAreaProblem() {
    const radius = Math.floor(Math.random() * 5) + 3; // 3-7
    const area = Math.round(radius * radius * 3.14 * 100) / 100;
    
    const svg = `
      <svg width="300" height="200" viewBox="0 0 300 200">
        <circle cx="150" cy="100" r="${radius * 15}" 
                fill="lightgreen" stroke="black" stroke-width="2"/>
        <line x1="150" y1="100" x2="${150 + radius * 15}" y2="100" 
              stroke="red" stroke-width="2"/>
        <text x="${150 + radius * 7}" y="95" font-size="12" font-family="Arial" fill="red">${radius}cm</text>
        <circle cx="150" cy="100" r="2" fill="black"/>
      </svg>
    `;

    return {
      problem: `半径が${radius}cmの円の面積を求めましょう。（円周率は3.14とします）`,
      svg: svg,
      answer: `${area}㎠`,
      explanation: `円の面積は 半径 × 半径 × 円周率 で求められます。${radius} × ${radius} × 3.14 = ${area}㎠です。`
    };
  }

  // 拡大縮小問題
  static generateScaleProblem() {
    const originalSize = Math.floor(Math.random() * 3) + 2; // 2-4
    const scale = 2;
    const newSize = originalSize * scale;
    
    const svg = `
      <svg width="400" height="200" viewBox="0 0 400 200">
        <!-- 元の図形 -->
        <rect x="50" y="50" width="${originalSize * 20}" height="${originalSize * 20}" 
              fill="lightblue" stroke="black" stroke-width="2"/>
        <text x="60" y="45" font-size="12" font-family="Arial">${originalSize}cm</text>
        <text x="25" y="70" font-size="12" font-family="Arial">${originalSize}cm</text>
        <text x="70" y="120" font-size="12" font-family="Arial">元の正方形</text>
        
        <!-- 矢印 -->
        <text x="150" y="100" font-size="16" font-family="Arial">→ ${scale}倍 →</text>
        
        <!-- 拡大された図形 -->
        <rect x="250" y="30" width="${newSize * 20}" height="${newSize * 20}" 
              fill="lightcoral" stroke="black" stroke-width="2"/>
        <text x="260" y="25" font-size="12" font-family="Arial">?cm</text>
        <text x="220" y="50" font-size="12" font-family="Arial">?cm</text>
        <text x="270" y="170" font-size="12" font-family="Arial">拡大した正方形</text>
      </svg>
    `;

    return {
      problem: `左の正方形を2倍に拡大しました。拡大した正方形の1辺の長さは何cmですか？`,
      svg: svg,
      answer: `${newSize}cm`,
      explanation: `元の長さが${originalSize}cmなので、2倍すると${originalSize} × 2 = ${newSize}cmになります。`
    };
  }
}

module.exports = SVGGeometryService;