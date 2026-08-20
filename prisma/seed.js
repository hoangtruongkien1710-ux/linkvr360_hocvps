import { execSync } from 'child_process'

try {
  execSync('npx prisma db push', { stdio: 'inherit' })
  execSync('npx prisma generate', { stdio: 'inherit' })
  execSync('npx prisma db seed', { stdio: 'inherit' })
  console.log('✅ Đã chạy db push, generate và seed thành công')
} catch (error) {
  console.error('❌ Lỗi khi chạy seed:', error)
}
