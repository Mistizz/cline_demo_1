// script.js

// 中央のワード入力フィールドを取得
const centralWordInput = document.getElementById('central-word');

// セルの要素を取得
const cells = document.querySelectorAll('.mandala-chart .cell');

// OpenAI APIキー
const API_KEY = process.env.API_KEY; // 環境変数からAPIキーを取得

// 関連ワードを取得する関数
async function fetchRelatedWords(word) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                {   role: 'system',
                    content: '日本語で回答してください.',
                },
                {
                    role: 'user',
                    content: `Provide 8 related words for the word "${word}". Separate each word with a comma.`
                }
            ],
            max_tokens: 50,
            temperature: 0.7,
            n: 1
        })
    });

    if (!response.ok) {
        console.error('APIリクエストに失敗しました:', response.statusText);
        return [];
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
        const text = data.choices[0].message.content.trim();
        // テキストをカンマで分割し、8ワードを取得
        const words = text.split(',').map(w => w.trim()).slice(0, 8);
        return words;
    } else {
        console.error('予期しないAPIレスポンス:', data);
        return [];
    }
}

// セルに関連ワードを表示する関数
function displayRelatedWords(words) {
    const positions = [
        'top',
        'top-right',
        'right',
        'bottom-right',
        'bottom',
        'bottom-left',
        'left',
        'top-left'
    ];

    positions.forEach((position, index) => {
        const cell = document.querySelector(`.cell.${position}`);
        if (cell && words[index]) {
            cell.textContent = words[index];
        }
    });
}

// 入力フィールドにイベントリスナーを追加
centralWordInput.addEventListener('keypress', async (event) => {
    if (event.key === 'Enter') {
        const word = centralWordInput.value.trim();
        if (word) {
            try {
                // 関連ワードを取得
                const relatedWords = await fetchRelatedWords(word);
                // セルに表示
                displayRelatedWords(relatedWords);
            } catch (error) {
                console.error('関連ワードの取得中にエラーが発生しました:', error);
            }
        }
    }
});
