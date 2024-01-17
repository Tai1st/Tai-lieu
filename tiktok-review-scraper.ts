1. Tạo một dự án NestJS mới. Mở Terminal và chạy lệnh sau:

```bash
npx @nestjs/cli new tiktok-follower-scrapper
```

2. Di chuyển vào thư mục dự án mới:

```bash
cd tiktok-follower-scrapper
```

3. Cài đặt một số dependencies cần thiết cho dự án:

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
  async scrapeFollowers(username: string): Promise<number> {
    const profileUrl = `https://www.tiktok.com/@${username}`;
    const response = await axios.get(profileUrl);
    const $ = cheerio.load(response.data);
    const followerCountText = $('.follower-count').text();
    const followerCount = parseInt(followerCountText.replace(',', '').trim());
    return followerCount;
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

  @Get(':username')
  async getFollowerCount(@Param('username') username: string): Promise<number> {
    const followerCount = await this.followerService.scrapeFollowers(username);
    return followerCount;
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
    return 'Welcome to TikTok Follower Scrapper API!';
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

Sau khi hoàn tất các bước trên, bạn có thể chạy ứng dụng bằng lệnh:

```bash
npm run start
```
