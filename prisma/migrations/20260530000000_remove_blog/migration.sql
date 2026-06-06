-- DropForeignKey (safe - only runs if table exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'BlogPost') THEN
    ALTER TABLE "BlogPost" DROP CONSTRAINT IF EXISTS "BlogPost_userId_fkey";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Tag') THEN
    ALTER TABLE "Tag" DROP CONSTRAINT IF EXISTS "Tag_userId_fkey";
  END IF;
END $$;

-- DropTable
DROP TABLE IF EXISTS "_BlogPostToTag";

-- DropTable
DROP TABLE IF EXISTS "BlogPost";

-- DropTable
DROP TABLE IF EXISTS "Tag";
