/**
 * Backlog Wiki記法パーサー
 * 
 * @example
 * const wikiText = "||項目||値||\n|項目1|値1|\n|項目2|値2|";
 * const html = parseBacklogWiki(wikiText);
 * 
 * 入力: Wiki記法文字列
 * 出力: HTML文字列
 */

/**
 * Backlog Wiki記法をHTMLに変換する
 * 
 * @param text - Wiki記法のテキスト
 * @returns 変換されたHTML
 */
export const parseBacklogWiki = (text: string): string => {
  let html = text;

  // テーブル記法の変換
  html = parseTable(html);
  
  // コードブロック記法の変換
  html = parseCodeBlock(html);
  
  // インラインコード記法の変換
  html = parseInlineCode(html);
  
  // 基本的なマークダウン記法の変換
  html = parseBasicMarkdown(html);
  
  return html;
};

/**
 * テーブル記法をHTMLに変換
 * ||ヘッダー1||ヘッダー2|| → <table>
 * |セル1|セル2| → <tr><td>
 */
const parseTable = (text: string): string => {
  const lines = text.split('\n');
  let result: string[] = [];
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // ヘッダー行の判定（||で囲まれている）
    if (line.startsWith('||') && line.endsWith('||')) {
      if (!inTable) {
        result.push('<table class="backlog-table">');
        result.push('<thead>');
        inTable = true;
      }
      
      const cells = line.slice(2, -2).split('||');
      result.push('<tr>');
      cells.forEach(cell => {
        result.push(`<th class="backlog-th">${cell.trim()}</th>`);
      });
      result.push('</tr>');
      result.push('</thead>');
      result.push('<tbody>');
    }
    // データ行の判定（|で囲まれている）
    else if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        result.push('<table class="backlog-table">');
        result.push('<tbody>');
        inTable = true;
      }
      
      const cells = line.slice(1, -1).split('|');
      result.push('<tr>');
      cells.forEach(cell => {
        result.push(`<td class="backlog-td">${cell.trim()}</td>`);
      });
      result.push('</tr>');
    }
    // テーブル終了
    else {
      if (inTable) {
        result.push('</tbody>');
        result.push('</table>');
        inTable = false;
      }
      result.push(line);
    }
  }
  
  // 最後にテーブルが開いている場合は閉じる
  if (inTable) {
    result.push('</tbody>');
    result.push('</table>');
  }
  
  return result.join('\n');
};

/**
 * コードブロック記法をHTMLに変換
 * {code:言語}...{/code} → <pre><code class="language-言語">
 */
const parseCodeBlock = (text: string): string => {
  // コードブロック記法のパターン
  const codeBlockPattern = /\{code(?::(\w+))?\}([\s\S]*?)\{\/code\}/g;
  
  return text.replace(codeBlockPattern, (match, language, code) => {
    const lang = language || 'text';
    const escapedCode = escapeHtml(code.trim());
    return `<pre class="backlog-code-block"><code class="language-${lang}">${escapedCode}</code></pre>`;
  });
};

/**
 * インラインコード記法をHTMLに変換
 * &code(コード); → <code>コード</code>
 */
const parseInlineCode = (text: string): string => {
  const inlineCodePattern = /&code\(([^)]+)\);/g;
  
  return text.replace(inlineCodePattern, (match, code) => {
    return `<code class="backlog-inline-code">${escapeHtml(code)}</code>`;
  });
};

/**
 * 基本的なマークダウン記法の変換
 */
const parseBasicMarkdown = (text: string): string => {
  const lines = text.split('\n');
  let result: string[] = [];
  
  for (const line of lines) {
    let processedLine = line;
    
    // まず太字記法を処理（すべての行で）
    processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 見出し
    if (line.startsWith('# ')) {
      const headingText = processedLine.substring(2);
      processedLine = `<h1 class="backlog-h1">${headingText}</h1>`;
    } else if (line.startsWith('## ')) {
      const headingText = processedLine.substring(3);
      processedLine = `<h2 class="backlog-h2">${headingText}</h2>`;
    } else if (line.startsWith('### ')) {
      const headingText = processedLine.substring(4);
      processedLine = `<h3 class="backlog-h3">${headingText}</h3>`;
    }
    // リスト
    else if (line.startsWith('- ')) {
      const listText = processedLine.substring(2);
      processedLine = `<p class="backlog-list">• ${listText}</p>`;
    }
    // 空行
    else if (processedLine.trim() === '') {
      processedLine = '<div class="backlog-spacer"></div>';
    } 
    // 通常のテキスト（HTMLタグが含まれていない場合）
    else if (!processedLine.startsWith('<')) {
      processedLine = `<p class="backlog-paragraph">${processedLine}</p>`;
    }
    
    result.push(processedLine);
  }
  
  return result.join('\n');
};

/**
 * HTMLエスケープ処理
 */
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Wiki記法のサンプルテンプレートを生成
 */
export const getWikiTemplates = () => {
  return {
    table: `||項目||値||説明||
|項目1|値1|説明1|
|項目2|値2|説明2|
|項目3|値3|説明3|`,
    
    codeBlock: `{code:javascript}
function hello() {
  console.log("Hello, Backlog!");
}
{/code}`,

    codeBlockWithLanguage: `{code:java}
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
{/code}`,

    inlineCode: `この関数は &code(console.log()); を使用してメッセージを出力します。`,

    combined: `# API仕様書

## エンドポイント一覧

||メソッド||エンドポイント||説明||
|GET|/api/users|ユーザー一覧取得|
|POST|/api/users|ユーザー作成|
|PUT|/api/users/:id|ユーザー更新|

## サンプルコード

{code:javascript}
const response = await fetch('/api/users', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});
const users = await response.json();
{/code}

実装時は &code(try-catch); を使用してエラーハンドリングを行ってください。`
  };
}; 