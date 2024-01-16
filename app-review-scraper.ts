// 1. Cài đặt NestJS và các thư viện cần thiết:
$ npm install --save @nestjs/core @nestjs/common @nestjs/platform-express
$ npm install --save google-play-scraper app-store-scraper
$ npm install --save pandas numpy
// 2. Tạo module và controller:
// app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
})
export class AppModule {}

// app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/reviews')
  getReviews() {
    return this.appService.getReviews();
  }
}

// app.service.ts
import { Injectable } from '@nestjs/common';
import { reviewsAll } from 'google-play-scraper';
import { AppStore } from 'app-store-scraper';
import { v4 as uuidv4 } from 'uuid';
import * as pd from 'pandas-js';

@Injectable()
export class AppService {
  async getReviews() {
    const g_reviews = await reviewsAll({
      appId: 'com.apphup.passwordmanager',
      lang: 'en',
      country: 'us',
    });

    const a_reviews = await new AppStore({
      country: 'us',
      appId: '1138075747',
    }).reviews();

    const g_df = new pd.DataFrame(g_reviews);
    g_df.drop(['userImage', 'reviewCreatedVersion'], { axis: 1 }, inplace=true);
    g_df.rename(
      {
        score: 'rating',
        userName: 'user_name',
        reviewId: 'review_id',
        content: 'review_description',
        at: 'review_date',
        replyContent: 'developer_response',
        repliedAt: 'developer_response_date',
        thumbsUpCount: 'thumbs_up',
      },
      { axis: 1 },
      inplace=true,
    );

    g_df.insert(0, 'source', 'Google Play');
    g_df.insert(3, 'review_title', null);
    g_df.set('language_code', 'en');
    g_df.set('country_code', 'us');

    const a_df = new pd.DataFrame(a_reviews);
    a_df.drop(['isEdited'], { axis: 1 }, inplace=true);
    a_df.insert(0, 'source', 'App Store');
    a_df.set('developer_response_date', null);
    a_df.set('thumbs_up', null);
    a_df.set('language_code', 'en');
    a_df.set('country_code', 'us');
    a_df.insert(1, 'review_id', a_df.index.map(() => uuidv4()));
    a_df.rename(
      {
        review: 'review_description',
        userName: 'user_name',
        date: 'review_date',
        title: 'review_title',
        developerResponse: 'developer_response',
      },
      { axis: 1 },
      inplace=true,
    );

    const result = g_df.concat(a_df);

    return result.to_json();
  }
}

//3. Khởi chạy ứng dụng NestJS:
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();