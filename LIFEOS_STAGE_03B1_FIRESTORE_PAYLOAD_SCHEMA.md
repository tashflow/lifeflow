# LifeFlow — Stage 03B.1 Firestore Payload Schema Validation

| Collection | Required Fields | Allowed Fields | Type & Range Constraints |
|---|---|---|---|
| `tasks` | `title`, `category`, `priority`, `completed` | `title`, `category`, `priority`, `dueDate`, `completed`, `notes` | title $\le 200$, category enum, priority enum, bool |
| `goals` | `title`, `category`, `progress` | `title`, `category`, `progress`, `targetDate`, `milestones` | title $\le 200$, progress 0-100 |
| `routines` | `time`, `title`, `category`, `completed`, `streak` | `time`, `title`, `category`, `completed`, `streak` | time $\le 20$, streak $\ge 0$ |
| `calendar` | `title`, `time`, `category`, `day` | `title`, `time`, `category`, `attendees`, `day` | day 1-31 |
| `finance` | `title`, `amount`, `type`, `category`, `date` | `title`, `amount`, `type`, `category`, `date` | amount number, type enum |
| `notes` | `title`, `folder`, `content`, `updatedAt` | `title`, `folder`, `content`, `updatedAt` | content $\le 5000$ |
| `documents` | `name`, `category`, `uploadDate`, `size` | `name`, `category`, `uploadDate`, `size`, `expiryDate` | name $\le 200$, category enum |
| `health` | `waterDrank`, `sleepHours`, `weight`, `steps`, `heartRate` | `waterDrank`, `sleepHours`, `weight`, `steps`, `heartRate` | all numbers $\ge 0$ |
| `family` | `name`, `relation`, `status` | `name`, `relation`, `status`, `avatarColor` | name $\le 100$ |
| `learning` | `title`, `provider`, `progress`, `category`, `status` | `title`, `provider`, `progress`, `category`, `status` | progress 0-100 |
| `emergency` | `name`, `phone` | `name`, `phone`, `relation` | phone $\le 50$ |
| `settings` | `language` | `language`, `theme` | language in `['en', 'bn', 'ar']` |
