/* Canonical exploration Field Skill registry derived from 08_SkillDB / 16_FieldSkill. */
(function(root){'use strict';
const rows=[];
rows.push(...[
["SK0334","霊峰","鉱脈","鉱脈探知","鉱物タグまたは採掘対象のある場所で採掘アクションを解放し、鉱石・結晶素材を採取できる。","Rank 8／ARC 0／1 MPt",1,3,"SP 6","所持で採掘を解放。Mastery Rank・ARCが高いほど鉱床情報→希少鉱判別→高品質素材選別の段階が上がり、取得候補・品質・追加取得が変化。同一採掘対象は1遠征1回。","探索地点","鉱物"],
["SK0339","海神","航祈","魚群探知","水域タグまたは漁対象のある場所で漁アクションを解放し、魚・水産素材を採取できる。","Rank 8／ARC 0／1 MPt",1,3,"SP 6","所持で漁を解放。Mastery Rank・ARCが高いほど魚群情報→希少種判別→高品質素材選別の段階が上がり、取得候補・品質・追加取得が変化。同一漁対象は1遠征1回。","探索地点","水域"],
["SK0340","海神","航祈","水の導き","水域タグの場所に生成済みの条件付き水路エッジがある場合、その特殊経路を利用可能にする。新しい場所ノードは生成しない。","Rank 10／ARC 0／2 MPt",2,4,"SP 12","Mastery Rank・ARCが高いほど潮流、安全性、水中の人工物などの専門情報を段階的に追加表示する。","探索地点","水域"],
["SK0348","森羅","翠風","鳥瞰","森林系の場所（主に植物タグ）に生成済みの条件付き脇道・高所経路がある場合、その特殊経路を利用可能にする。新しい場所ノードは生成しない。","Rank 10／ARC 0／2 MPt",2,4,"SP 12","Mastery Rank・ARCが高いほど地形、獣道、危険、先の場所傾向などの専門情報を段階的に追加表示する。","探索地点","植物"],
["SK0350","森羅","樹花","薬草採集","植物タグまたは採集対象のある場所で採集アクションを解放し、薬草・毒草・食材・錬金素材を採取できる。","Rank 10／ARC 0／2 MPt",2,4,"SP 6","Mastery Rank・ARCが高いほど植物情報→希少植物判別→高品質素材選別の段階が上がり、取得候補・品質・追加取得が変化。同一採集対象は1遠征1回。","探索地点","植物"]
]);
// next
rows.push(["SK0355","森羅","霊獣","狩りの勘","獣タグの場所で狩猟アクションを解放する。","Rank 10／ARC 0／2 MPt",2,4,"SP 6","RankとARCで獲得候補・品質・追加取得の段階が上がる。","探索地点","獣"]);
rows.push(["SK0408","機巧","鍛冶","鍛造","探索中の簡易加工を行う。","Rank 2／ARC 0／1 MPt",1,1,"SP 12","持込済みの識別素材を用いる簡易加工。","探索地点","素材依存"]);
rows.push(...[
["SK0404","符術","巫祭","招霊","聖域・呪いタグの場所にある条件付き経路を利用可能にする。","Rank 8／ARC 0／1 MPt",1,3,"SP 12","残留思念・封印状態・危険性を段階表示する。","探索地点","聖域;呪い"],
["SK0413","機巧","遺構","遺構解析","遺物・機械タグの場所にある条件付き経路や装置操作を利用可能にする。","Rank 6／ARC 0／1 MPt",1,2,"SP 12","古代装置の状態・危険・接続先を段階表示する。","探索地点","遺物;機械"],
["SK0414","機巧","遺構","古代回路","機械・遺物タグの場所で部品回収アクションを解放する。","Rank 8／ARC 0／1 MPt",1,3,"SP 8","RankとARCで部品候補・品質・追加取得の段階が上がる。","探索地点","機械;遺物"],
["SK0415","機巧","遺構","修復工学","装備中の武器を現地整備し、次の戦闘だけ一時強化する。","Rank 10／ARC 0／2 MPt",2,4,"SP 14","耐久値は追加せず、次戦限定の一時強化として扱う。","探索地点","素材依存"]
]);
rows.push(...[
["SK0071","探索","盗技","宝箱解錠","宝箱に対する専門解錠アクションを解放する。","Rank 1／SKL 0／1 MPt",1,1,"SP 6","RankとSKLで対応できる鍵難度と安全性の段階が上がる。","探索地点","汎用"],
["SK0075","探索","盗技","罠外し","罠に対する専門解除アクションを解放する。","Rank 4／SKL 0／1 MPt",1,1,"SP 11","RankとSKLで仕掛け情報・対応難度・安全性の段階が上がる。","探索地点","汎用"],
["SK0426","探索","盗技","扉解錠","任意の施錠扉に対する専門解錠アクションを解放する。","Rank 7／SKL 0／1 MPt",1,2,"SP 10","必須進路を塞がず、近道・任意区画への追加選択肢として扱う。","探索地点","汎用"],
["SK0072","探索","隠密","潜伏","通常敵との遭遇時に戦闘回避の選択肢を強化する。","Rank 1／SKL 0／1 MPt",1,1,"SP 6","敵警戒度・地形を含む対抗判定を補助する。","探索地点","汎用"],
["SK0427","探索","隠密","先制攻撃","通常戦闘開始時の先制判定を有利にする。","Rank 4／SKL 0／1 MPt",1,1,"なし","戦闘開始時の対抗判定に作用する。","戦闘開始時（セット中自動）","汎用"],
["SK0428","探索","隠密","逃走経路","現在の戦闘の逃走判定を助ける。","Rank 7／SKL 0／1 MPt",1,2,"SP 12","通常の逃走と同じ1Tを消費し、ボスには使用不可。","戦闘","汎用"]
]);
rows.push(...[
["SK0073","探索","索敵","索敵","場所の敵種・危険度・人数傾向などの汎用情報を追加表示する。","Rank 1／SKL 0／1 MPt",1,1,"SP 11","RankとSKLで次の分岐から2手先・敵編成傾向・局所地形まで情報段階が上がる。","探索地点","汎用"],
["SK0076","探索","索敵","奇襲回避","通常戦闘開始時の敵奇襲判定を不利にしにくくする。","Rank 4／SKL 0／1 MPt",1,1,"なし","戦闘開始時の対抗判定に作用する。","戦闘開始時（セット中自動）","汎用"],
["SK0079","探索","索敵","宝箱探知","場所に生成済みの隠し宝箱や宝の気配を発見し、探索情報として表示する。","Rank 7／SKL 0／1 MPt",1,2,"SP 12","RankとSKLで存在・位置・種別・希少度の手掛かりまで情報段階が上がる。","探索地点","汎用"],
["SK0074","探索","鑑識","素材見極め","入手素材の種類・品質・用途の手掛かりを段階的に表示する。正式鑑定は帰還後。","Rank 1／SKL 0／1 MPt",1,1,"SP 11","RankとSKLで素材系統・品質・希少性・用途候補まで開示する。","探索地点","汎用"],
["SK0078","探索","鑑識","弱点鑑識","選んだ敵1体の耐性・部位・異常/封じ情報を段階的に得る。","Rank 4／SKL 0／1 MPt",1,1,"SP 16","RankとSKLで大分類から部位・異常/封じ詳細まで情報段階が上がる。","戦闘","汎用"],
["SK0080","探索","鑑識","魔物知識","戦闘勝利時に敵素材の候補・正体を見抜き、通常戦利品の取得候補を広げる。","Rank 7／SKL 0／1 MPt",1,2,"なし","RankとSKLで素材候補・希少候補・選別/追加取得の段階が上がる。","戦闘勝利時（セット中自動）","汎用"]
]);
rows.push(...[
["SK0389","魔術","錬金","\u56de\u5fa9\u85ac\u8abf\u5408","探索中に回復用の携行品を簡易作成する。","Rank 6／ARC 0／1 MPt",1,2,"SP 10","持込済みの識別素材を使い、完成品は探索中に使用できる。","探索地点","素材依存"],
["SK0390","魔術","錬金","\u6bd2\u85ac\u8abf\u5408","探索中に加工用の携行品を簡易作成する。","Rank 8／ARC 0／1 MPt",1,3,"SP 10","持込済みの識別素材を使い、完成品は探索中に使用できる。","探索地点","素材依存"]
]);
function reqInfo(s){const m=String(s||'').match(/Rank\s*(\d+).*?(PHY|SKL|ARC|MND)\s*(\d+)/);return {rank:m?+m[1]:1,stat:m?m[2]:'SKL',value:m?+m[3]:0}}
function spInfo(s){const m=String(s||'').match(/SP\s*(\d+)/);return m?+m[1]:0}
const skills={},byId={};
for(const r of rows){const[id,mastery,branch,name,description,req,tpCost,setCost,costText,extra,scene,tags]=r,q=reqInfo(req),automatic=/セット中自動/.test(scene);const d={id,mastery,branch,name,description,rank:q.rank,stat:q.stat,statValue:q.value,tpCost,setCost,spCost:spInfo(costText),costText,extra,scene,fieldTags:String(tags||'').split(';').filter(Boolean),mode:automatic?'Passive':'Field',kind:'field',canonical437:true};skills[name]=d;byId[id]=d}
const api={version:1,catalogVersion:437,count:rows.length,canonicalCount:25,rows,skills,byId,aliases:{}};
function installIntoRules(){
 const R=root.RPG_RULES;if(!R?.skills||!R?.masteries)return;
 for(const d of Object.values(skills)){
  for(const md of Object.values(R.masteries))for(const branch of Object.keys(md.branches||{}))md.branches[branch]=(md.branches[branch]||[]).filter(n=>R.skills[n]?.id!==d.id);
  let legacy=null;
  for(const [k,v] of Object.entries(R.skills))if(v?.id===d.id){legacy=k;break}
  if(legacy&&legacy!==d.name)api.aliases[legacy]=d.name;
  const rt={id:d.id,name:d.name,mode:d.mode,kind:'field',costType:d.spCost?'SP':null,cost:d.spCost,setCost:d.setCost,mult:0,attr:'無',range:'none',scope:'single',stat:d.stat,target:'self',unlocks:[{mastery:d.mastery,branch:d.branch,rank:d.rank,stat:d.stat,value:d.statValue}],description:d.description,fieldTags:d.fieldTags,tpCost:d.tpCost,fieldSpec:d,canonical:true};
  R.skills[d.name]=rt;
  if(legacy&&legacy!==d.name)R.skills[legacy]=rt;
  const m=R.masteries[d.mastery];if(m){
   m.branches[d.branch]??=[];
   m.branches[d.branch]=[...new Set(m.branches[d.branch].map(n=>R.skills[n]?.id===d.id?d.name:n).concat(d.name))];
  }
 }
}
api.canonicalName=n=>api.aliases[n]||n;api.installIntoRules=installIntoRules;installIntoRules();
if(typeof module!=='undefined')module.exports=api;root.RPG_FIELD_SKILLS_437=api;
})(typeof globalThis!=='undefined'?globalThis:this);
