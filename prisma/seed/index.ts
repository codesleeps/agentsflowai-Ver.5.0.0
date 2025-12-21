import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const services = [
        {
            name: 'Starter Package',
            description: 'Perfect for small businesses - includes social media setup, basic SEO audit, 1 month support, email template',
            tier: 'basic',
            price: 999,
            features: ['Social Media Setup', 'Basic SEO Audit', '1 Month Support', 'Email Template'],
            is_active: true,
        },
        {
            name: 'Growth Package',
            description: 'For scaling businesses - includes full SEO optimization, PPC campaign management, content strategy, 3 months support, monthly reporting',
            tier: 'growth',
            price: 2499,
            features: ['Full SEO Optimization', 'PPC Management', 'Content Strategy', '3 Months Support', 'Monthly Reporting'],
            is_active: true,
        },
        {
            name: 'Enterprise Package',
            description: 'Complete digital transformation - includes dedicated account manager, custom integrations, advanced analytics, 24/7 support, quarterly strategy reviews, multi-channel campaigns',
            tier: 'enterprise',
            price: 4999,
            features: ['Dedicated Account Manager', 'Custom Integrations', 'Advanced Analytics', '24/7 Support', 'Quarterly Strategy Reviews'],
            is_active: true,
        },
    ]

    console.log('Seeding services...')
    for (const service of services) {
        const existing = await prisma.service.findFirst({
            where: { name: service.name }
        })

        if (!existing) {
            await prisma.service.create({
                data: service,
            })
            console.log(`Created service: ${service.name}`)
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
