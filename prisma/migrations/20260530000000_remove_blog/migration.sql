-- DropForeignKey
ALTER TABLE "BlogPost" DROP CONSTRAINT IF EXISTS "BlogPost_userId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT IF EXISTS "Tag_userId_fkey";

-- DropTable
DROP TABLE IF EXISTS "_BlogPostToTag";

-- DropTable
DROP TABLE IF EXISTS "BlogPost";

-- DropTable
DROP TABLE IF EXISTS "Tag";
