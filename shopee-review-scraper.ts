
1. Đầu tiên, hãy tạo một dự án NestJS mới. Mở Terminal và chạy lệnh sau:

```bash
npx @nestjs/cli new shopee-follower-scrapper
```

2. Di chuyển vào thư mục dự án mới:

```bash
cd shopee-follower-scrapper
```

3. Tiếp theo, cài đặt một số dependencies cần thiết cho dự án:

```bash
npm install axios cheerio
```

4. Tạo một file `follower.service.ts` trong thư mục `src/follower` với nội dung sau:

```typescript
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import cheerio from 'cheerio';

@Injectable()
export class FollowerService {
  async scrapeFollowers(shopUrl: string): Promise<number> {
    const response = await axios.get(shopUrl);
    const $ = cheerio.load(response.data);
    const followersCountText = $('.followers-count').text();
    const followersCount = parseInt(followersCountText.replace('Followers', '').replace(',', '').trim());
    return followersCount;
  }
}
```

5. Tạo một file `follower.controller.ts` trong thư mục `src/follower` với nội dung sau:

```typescript
import { Controller, Get, Param } from '@nestjs/common';
import { FollowerService } from './follower.service';

@Controller('followers')
export class FollowerController {
  constructor(private readonly followerService: FollowerService) {}

  @Get(':shopId')
  async getFollowersCount(@Param('shopId') shopId: string): Promise<number> {
    const shopUrl = `https://shopee.com.my/shop/${shopId}`;
    const followersCount = await this.followerService.scrapeFollowers(shopUrl);
    return followersCount;
  }
}
```

6. Cập nhật file `app.controller.ts` trong thư mục `src` với nội dung sau:

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Welcome to Shopee Follower Scrapper API!';
  }
}
```

7. Cập nhật file `app.module.ts` trong thư mục `src` với nội dung sau:

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { FollowerController } from './follower/follower.controller';
import { FollowerService } from './follower/follower.service';

@Module({
  imports: [],
  controllers: [AppController, FollowerController],
  providers: [FollowerService],
})
export class AppModule {}
```

 8. Cuối cùng, cập nhật file `main.ts` trong thư mục `src` với nội dung sau:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

Sau khi bạn đã hoàn tất các bước trên, bạn có thể chạy ứng dụng bằng lệnh:

```bash
npm run start
