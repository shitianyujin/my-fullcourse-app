// app/about/page.tsx
import React from 'react';
import Link from 'next/link';
import { FaYoutube, FaUtensils, FaGlassCheers, FaLightbulb } from 'react-icons/fa';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* メインカード */}
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden mb-10">
        
        {/* ヘッダー画像エリア（グラデーション） */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-10 text-center text-white">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
            その冷凍食品は、<br/>
            組み合わせることで「フルコース」になる。
          </h1>
          <p className="text-indigo-100 text-lg">
            『おれふる』へようこそ
          </p>
        </div>

        <div className="p-8 md:p-12">
          
          {/* 1. 開発のきっかけ (BSノブロック) */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <FaYoutube className="text-red-600 text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">開発のきっかけ</h2>
            </div>
            
            <div className="prose text-gray-600 leading-relaxed mb-6">
              <p className="mb-4">
                このアプリは、YouTubeチャンネル<a href="https://www.youtube.com/@NOBROCKTV" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium mx-1">佐久間宣行のNOBROCK TV</a>のサブチャンネルである、
                <a href="https://www.youtube.com/@BS_NOBROCK" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium mx-1">BSノブロック〜新橋ヘロヘロ団〜</a>
                で公開された、以下の動画たちに着想を得て開発されました。
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
              <a 
                href="https://youtu.be/8CZoKwzqoag?si=L7bpcZXLKFSngpmS" // ※実際のURLがわかれば置き換えてください、なければ検索リンク等でも可
                target="_blank" 
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="flex items-start">
                  <span className="text-red-500 mt-1 mr-2">▶</span>
                  <span className="group-hover:text-indigo-600 group-hover:underline transition font-medium text-gray-800">
                    【1人800円】佐久間プレゼンツ！絶品冷凍食品フルコース9品でお酒を飲んだら止まらなくなった
                  </span>
                </div>
              </a>
              <a 
                href="https://youtu.be/Nd8fcGOMaAk?si=VcCoRgqxkskOuJvo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="flex items-start">
                  <span className="text-red-500 mt-1 mr-2">▶</span>
                  <span className="group-hover:text-indigo-600 group-hover:underline transition font-medium text-gray-800">
                    【衝撃】佐久間オススメの冷凍食品で昼飲みをキメたら最高だった
                  </span>
                </div>
              </a>
            </div>
            
            <p className="mt-6 text-gray-600">
              コンビニやスーパーで手に入る冷凍食品を、ただ食べるのではなく<strong>「前菜」「メイン」「シメ」「デザート」というコース仕立て</strong>で味わう。
              そんな「大人の本気の遊び」に感銘を受け、
              <strong>「みんなが考えた最強のフルコースを共有できる場所がほしい！」</strong>と思い、このアプリを作りました。
            </p>
          </section>

          <hr className="border-gray-200 my-10" />

          {/* 2. アプリでできること */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <FaLightbulb className="text-yellow-600 text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">『おれふる』でできること</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
                <h3 className="font-bold text-lg text-indigo-900 mb-2 flex items-center">
                  <FaUtensils className="mr-2" />
                  コースを作る
                </h3>
                <p className="text-gray-700 text-sm">
                  「セブンイレブンのあれと、ローソンのあれを組み合わせたら最強では？」
                  そんなアイデアを形にしましょう。前菜からデザートまで、あなたの理想の構成を投稿してください。
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
                <h3 className="font-bold text-lg text-purple-900 mb-2 flex items-center">
                  <FaGlassCheers className="mr-2" />
                  みんなのコースを楽しむ
                </h3>
                <p className="text-gray-700 text-sm">
                  「食べたい！」と思ったコースは保存したり、実際に試したら「食べたよ」や評価を送ることができます。
                  今夜の晩酌のメニューは、ランキングから探してみませんか？
                </p>
              </div>
            </div>
          </section>

          {/* 3. 開発者からのメッセージ */}
          <section className="bg-gray-800 text-gray-300 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-4">
              さあ、今夜は千円札を握りしめてスーパーへ。
            </h3>
            <p className="leading-relaxed mb-6">
              冷凍食品の進化は止まりません。<br/>
              手軽で、安くて、驚くほど美味しい。<br/>
              そんな逸品たちを組み合わせて、あなただけの至高のフルコースを見つけてください。
            </p>
            <Link 
              href="/" 
              className="inline-block bg-white text-gray-900 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition transform hover:scale-105"
            >
              コースを探しに行く
            </Link>
          </section>

        </div>
      </div>
    </div>
  );
}