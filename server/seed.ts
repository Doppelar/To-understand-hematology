import { db } from './db';
import { societies, conferences } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function seed() {
  console.log('Seeding database...');

  try {
    // Truncate tables to avoid duplicates
    console.log('Truncating tables...');
    await db.execute(sql`TRUNCATE TABLE conferences CASCADE`);
    await db.execute(sql`TRUNCATE TABLE society_officials CASCADE`);
    await db.execute(sql`TRUNCATE TABLE societies CASCADE`);
    console.log('Tables truncated');

    // Insert societies
    const [jsh, jshct, jsmo] = await db.insert(societies).values([
      {
        name: '日本血液学会',
        shortName: 'JSH',
        description: '血液学の進歩と普及を図り、国民の健康と福祉に貢献することを目的とする学会',
      },
      {
        name: '日本造血細胞移植学会',
        shortName: 'JSHCT',
        description: '造血細胞移植の発展と患者の治療成績向上を目指す学会',
      },
      {
        name: '日本臨床腫瘍学会',
        shortName: 'JSMO',
        description: '悪性腫瘍の臨床・研究の発展を目指す学会',
      },
    ]).returning();

    console.log('Societies inserted:', jsh.id, jshct.id, jsmo.id);

    // Insert conferences for JSH
    await db.insert(conferences).values([
      {
        societyId: jsh.id,
        year: '2024',
        number: '第86回',
        title: '日本血液学会学術集会',
        theme: '血液疾患治療の新展開',
        location: '東京',
        president: '田中太郎',
        date: '2024年10月11日-13日',
      },
      {
        societyId: jsh.id,
        year: '2023',
        number: '第85回',
        title: '日本血液学会学術集会',
        theme: '血液学の最新知見',
        location: '大阪',
        president: '佐藤花子',
        date: '2023年10月13日-15日',
      },
      {
        societyId: jsh.id,
        year: '2022',
        number: '第84回',
        title: '日本血液学会学術集会',
        location: '名古屋',
        president: '鈴木一郎',
        date: '2022年10月14日-16日',
      },
    ]);

    // Insert conferences for JSHCT
    await db.insert(conferences).values([
      {
        societyId: jshct.id,
        year: '2024',
        number: '第46回',
        title: '日本造血細胞移植学会総会',
        theme: '造血細胞移植の革新',
        location: '福岡',
        president: '山田次郎',
        date: '2024年3月7日-9日',
      },
      {
        societyId: jshct.id,
        year: '2023',
        number: '第45回',
        title: '日本造血細胞移植学会総会',
        location: '仙台',
        president: '高橋三郎',
        date: '2023年3月9日-11日',
      },
    ]);

    // Insert conferences for JSMO
    await db.insert(conferences).values([
      {
        societyId: jsmo.id,
        year: '2024',
        number: '第22回',
        title: '日本臨床腫瘍学会学術集会',
        theme: '腫瘍治療の未来',
        location: '横浜',
        president: '伊藤四郎',
        date: '2024年7月18日-20日',
      },
    ]);

    console.log('Conferences inserted successfully');
    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seed();
