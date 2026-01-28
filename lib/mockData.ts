import { is } from "date-fns/locale"
import { Story, Blog, Event } from "@/types"
import { time } from "console"

export const initialBlogs = [
    {
        id: 0,
        title: "From Struggle to Strength: How Amina Built a New Life in Canada",
        category: "Community",
        date: "August 10, 2025",
        description:
            "Discover Amina's inspiring immigrant story - a powerful reminder that resilience and community can turn even the hardest beginnings into stories of hope.",
        image: "/bloghero.png",
        isFeaturedBlog: true,
        content: {
            introduction:
                "Moving to a new country brings incredible opportunities, but it also poses an important question: How do you rebuild in ways you never imagined? For Amina, a 32-year-old software engineer from Somalia, the answer lay in embracing both the challenges and a source of strength.",
            sections: [
                {
                    title: "Honoring the Past",
                    content:
                        "From the moment she arrived in Toronto at 28—fleeing family persecution—Amina found herself caught between two worlds. Through determination, she learned to navigate these challenges while staying true to her roots.",
                },
                {
                    title: "Building a Future",
                    content:
                        "Integration required tremendous adaptation: learning a new language, navigating unfamiliar job markets, and building connections. Education and community became her bridge to opportunity.",
                },
                {
                    title: "The Power of Community",
                    content:
                        "Perhaps most importantly, Amina built a strong sense of community among fellow immigrants. These bonds helped her—and many others—thrive in new soil.",
                },
            ],
            closingThoughts:
                "Amina’s resilience story reminds us that immigrant journeys are not just about surviving—they’re about thriving and helping others do the same.",
        },
    },
    {
        id: 1,
        title: "5 Everyday Rituals That Help Immigrant Women Stay Grounded",
        category: "Lifestyle",
        date: "August 10, 2025",
        description: "Simple daily practices to nurture your mental health and embrace your cultural identity while...",
        image: "/woman-profile.png",
        isFeaturedBlog: false,
        content: {
            introduction:
                "Moving to a new country brings incredible opportunities, but it also poses an important question: How do you rebuild in ways you never imagined? For Amina, a 32-year-old software engineer from Somalia, the answer lay in embracing both the challenges and a source of strength.",
            sections: [
                {
                    title: "Honoring the Past",
                    content:
                        "From the moment she arrived in Toronto at 28 years - fleeing family persecution, to family, parents, and siblings whether it's speaking cultural pride or maintaining traditions, Amina found herself caught between two worlds. Through determination, she learned to navigate these challenges while staying true to her roots.",
                },
                {
                    title: "Building a Future",
                    content:
                        "Yet integration, like a new city requires tremendous adaptations. Embracing the foreign language, navigating unfamiliar job markets, and embracing a culture of many traditions in different parts of the world, Amina found her path through education and community connections.",
                },
                {
                    title: "The Power of Community",
                    content:
                        "Perhaps most importantly, Amina learned to build a strong sense of community among fellow immigrants. Through these connections, she discovered they had more in common - they knew from one another's challenges for building up their lives with thriving in new soil.",
                },
            ],
            closingThoughts:
                "Amina's resilience story is about accepting change, the shared embracing the essence of who you are as you grow. Immigrant women like Amina remind us that our stories are not just about surviving - they're about thriving and helping others do the same.",
        },
    },
    {
        id: 2,
        title: "10 Immigrant Women Shaping Music and Film Around the World",
        category: "Entertainment",
        date: "August 10, 2025",
        description: "Meet the trailblazers who are changing the soundtrack to a brighter future...",
        image: "/woman-profile.png",
        isFeaturedBlog: false,
        content: {
            introduction:
                "Maintaining your sense of self while adapting to a new culture can be challenging. These five daily rituals help immigrant women stay connected to their roots while building new lives.",
            sections: [
                {
                    title: "Morning Cultural Practices",
                    content:
                        "Starting your day with familiar rituals - whether it's brewing traditional tea, saying morning prayers, or listening to music from home - creates a sense of continuity and comfort.",
                },
                {
                    title: "Language Preservation",
                    content:
                        "Speaking your native language daily, even if just to yourself, helps maintain this crucial connection to your identity and heritage.",
                },
            ],
            closingThoughts:
                "These simple practices create anchors in the storm of change, helping you stay grounded while embracing growth.",
        },
    },
    {
        id: 3,
        title: "How to Navigate Job Hunting as a Newcomer",
        category: "Career",
        categoryColor: "bg-green-600",
        date: "August 10, 2025",
        description: "Practical tips for immigrant women seeking their first job in a new country - from CV tips tretstesetsetsytestsysyrsys",
        image: "/woman-profile.png",
        isFeaturedBlog: false,
        content: {
            introduction:
                "From Hollywood to Bollywood, immigrant women are reshaping the entertainment industry with their unique perspectives and incredible talent.",
            sections: [
                {
                    title: "Breaking Barriers in Film",
                    content:
                        "Directors like Chloé Zhao and Lulu Wang have brought immigrant stories to mainstream cinema, winning critical acclaim and opening doors for others.",
                },
                {
                    title: "Musical Innovations",
                    content:
                        "Artists are blending traditional sounds with contemporary styles, creating new genres that speak to the immigrant experience.",
                },
            ],
            closingThoughts:
                "These women are not just entertainers - they're cultural ambassadors, sharing their stories and enriching our global narrative.",
        },
    },
    {
        id: 4,
        title: "Breaking the Silence on Mental Health in Immigrant Communities",
        category: "Health & Wellness",
        date: "August 10, 2025",
        description: "Why immigrant women need safe spaces to discuss mental health and where to find support...",
        image: "/woman-profile.png",
        isFeaturedBlog: false,
    },
    {
        id: 5,
        title: "Keeping Traditions Alive While Building a Future Abroad",
        category: "Culture",
        date: "August 10, 2025",
        description: "How immigrant women balance cultural heritage with building new lives in unfamiliar places...",
        image: "/woman-profile.png",
    },

]

export const additionalBlogs = [
    {
        id: 6,
        title: "Scholarships Opening Doors for First-Generation Students",
        category: "Education",
        date: "August 10, 2025",
        description: "How new programs are helping immigrant daughters achieve their dreams...",
        image: "/woman-profile.png",
    },
    {
        id: 7,
        title: "Building Financial Literacy in Your New Country",
        category: "Finance",
        date: "August 10, 2025",
        description: "Essential money management tips for immigrant women starting fresh...",
        image: "/woman-profile.png",
    },
    {
        id: 8,
        title: "The Power of Sisterhood: Finding Your Tribe",
        category: "Community",
        date: "August 10, 2025",
        description: "How immigrant women are creating support networks that change lives...",
        image: "/woman-profile.png",
    },
    {
        id: 9,
        title: "Entrepreneurship: Turning Skills into Success",
        category: "Business",
        date: "August 10, 2025",
        description: "Stories of immigrant women who built thriving businesses from their talents...",
        image: "/woman-profile.png",
    },
    {
        id: 10,
        title: "Navigating Healthcare Systems as an Immigrant",
        category: "Health & Wellness",
        date: "August 10, 2025",
        description: "Understanding your rights and accessing quality healthcare in your new home...",
        image: "/woman-profile.png",
    },
    {
        id: 11,
        title: "Celebrating Heritage Through Food and Family",
        category: "Culture",
        date: "August 10, 2025",
        description: "How traditional recipes become bridges between generations and cultures...",
        image: "/woman-profile.png",
    },
    {
        id: 12,
        title: "Language Learning: Beyond Words to Belonging",
        category: "Education",
        date: "August 10, 2025",
        description: "The journey of mastering a new language and finding your voice...",
        image: "/woman-profile.png",
    },
]

export const initialStories = [
    {
        id: 1,
        title: "Sweet Success: Gabriela's Bakery Dream",
        category: "Lifestyle",
        date: "August 15, 2025",
        description:
            "After years of perfecting her grandmother's recipes, Gabriela's sweet success is a story of determination and cultural heritage.",
        image: "/woman-profile.png",
        isFeaturedStory: false,
        content: {
            introduction:
                "Gabriela's journey from home baker to successful business owner represents the dreams of many immigrant women who bring their cultural treasures to new lands.",
            sections: [
                {
                    title: "The Beginning",
                    content:
                        "Starting with just her grandmother's handwritten recipes and a small oven, Gabriela began her journey in her apartment kitchen.",
                },
                {
                    title: "Building Community",
                    content:
                        "Through her bakery, Gabriela created not just delicious pastries, but a gathering place for her community to connect and celebrate their heritage.",
                },
            ],
        },
    },
    {
        id: 2,
        title: "Finding Home in a New Land",
        category: "Community",
        date: "August 12, 2025",
        description:
            "When I arrived in Toronto, I spoke little English and knew no one. Starting my story here was like finding a community that feels like family.",
        image: "/bloghero.png",
        isFeaturedStory: true,
        author: "Zhang Mei",
        content: {
            introduction:
                "Zhang Mei's story of finding belonging in a new country resonates with countless immigrant women seeking connection and community.",
            sections: [
                {
                    title: "First Steps",
                    content:
                        "The initial months were challenging, filled with language barriers and cultural adjustments that tested her resilience.",
                },
                {
                    title: "Finding Community",
                    content:
                        "Through local community centers and immigrant support groups, Zhang Mei slowly built the connections that would become her chosen family.",
                },
            ],
        },
    },
    {
        id: 3,
        title: "Priya's Path to Mentorship in the UK",
        category: "Entertainment",
        date: "August 15, 2025",
        description: "She arrived with a suitcase that is dream – now she's mentoring other immigrant women to thrive.",
        image: "/woman-profile.png",
        isFeaturedStory: false,
        content: {
            introduction:
                "Priya's transformation from newcomer to mentor showcases the power of paying it forward in immigrant communities.",
            sections: [
                {
                    title: "The Arrival",
                    content:
                        "With limited resources but unlimited determination, Priya began her journey in the UK with hope and ambition.",
                },
                {
                    title: "Giving Back",
                    content:
                        "Now established, Priya dedicates her time to helping other immigrant women navigate the challenges she once faced.",
                },
            ],
        },
    },
    {
        id: 4,
        title: "Faith and Motherhood: Amina in Germany",
        category: "Career",
        date: "August 15, 2025",
        description: "Navigating motherhood in a new country, Amina shares her journey of faith and resilience.",
        image: "/woman-profile.png",
        isFeaturedStory: false,
        content: {
            introduction:
                "Amina's story explores the intersection of faith, motherhood, and cultural adaptation in a new homeland.",
            sections: [
                {
                    title: "Balancing Act",
                    content:
                        "Managing the demands of motherhood while adapting to a new culture required strength and flexibility.",
                },
                {
                    title: "Community Support",
                    content:
                        "Finding other mothers who shared similar experiences became crucial to Amina's journey of belonging.",
                },
            ],
        },
    },
]

export const additionalStories = [
    {
        id: 5,
        title: "Breaking Barriers in Tech: Fatima's Journey",
        category: "Career",
        date: "August 10, 2025",
        description: "From coding bootcamp to tech leadership, Fatima's story inspires immigrant women in STEM.",
        image: "/woman-profile.png",
        isFeaturedStory: false,
        content: {
            introduction:
                "Fatima's rise in the tech industry demonstrates how determination and skill can overcome barriers.",
            sections: [
                {
                    title: "Learning to Code",
                    content:
                        "Starting with online tutorials and bootcamps, Fatima built the technical skills needed for her career transition.",
                },
            ],
        },
    },
    {
        id: 6,
        title: "Cultural Fusion: Maria's Restaurant Success",
        category: "Lifestyle",
        date: "August 8, 2025",
        description: "Blending traditional recipes with local tastes, Maria created a culinary bridge between cultures.",
        image: "/woman-profile.png",
        isFeaturedStory: false,
        content: {
            introduction: "Maria's restaurant became more than a business—it became a cultural ambassador.",
            sections: [
                {
                    title: "Recipe Innovation",
                    content:
                        "Adapting family recipes to local palates while maintaining authentic flavors required creativity and patience.",
                },
            ],
        },
    },
]

export const Events: Event[] = [
    {
        id: "1",
        title: 'Virtual Workshop: "Telling Your Story With Confidence"',
        date: "September 10, 2025",
        dateCreated: "12/05/2025",
        lastUpdated: "12/05/2025",
        time: "10:00 AM",
        location: "Live on Zoom",
        description: "A guided session to help immigrant women craft and share their personal narratives.",
        featured: true,
        status: "active",
        image: "/diverse-women-celebrating-together-at-community-ev.jpg",
        meetingLink: "https://zoom.us/j/123456789?pwd=abc123",
    },
    {
        id: "2",
        title: 'Panel Discussion: "Breaking Barriers in New Homelands"',
        date: "September 15, 2025",
        dateCreated: "12/05/2025",
        lastUpdated: "12/05/2025",
        time: "2:00 PM",
        location: "Live on Zoom",
        description: "A guided session to help immigrant women craft and share their personal narratives.",
        featured: false,
        status: "active",
        image: "/diverse-women-celebrating-together-at-community-ev.jpg",
        meetingLink: "https://zoom.us/j/987654321?pwd=xyz789",
    },
    {
        id: "3",
        title: 'Community Meetup: "Sharing Our Heritage"',
        date: "September 20, 2025",
        dateCreated: "12/05/2025",
        lastUpdated: "12/05/2025",
        time: "6:00 PM", // Added missing time
        location: "Community Center",
        description: "A guided session to help immigrant women craft and share their personal narratives.",
        featured: false,
        status: "active",
        image: "/diverse-women-celebrating-together-at-community-ev.jpg",
        meetingLink: "https://zoom.us/j/456789123?pwd=def456",
    },
    {
        id: "4",
        title: 'Past Workshop: "Building Confidence"',
        date: "August 25, 2025",
        dateCreated: "11/25/2025",
        lastUpdated: "11/25/2025",
        time: "3:00 PM", // Added missing time
        location: "Community Center",
        description: "A completed session that helped immigrant women build confidence in their new environment.",
        featured: false,
        status: "ended",
        image: "/diverse-women-celebrating-together-at-community-ev.jpg",
        meetingLink: "https://zoom.us/j/456789123?pwd=def456",
    },
];

export const initialStories1: Story[] = [
    {
        id: "12345",
        title: "From Struggle to Strength: My Immigration Journey",
        summary: "A personal account of overcoming challenges and finding hope in a new country.",
        content:
            "<p>Moving to a new country was the hardest thing I ever did. <strong>The language barrier</strong> seemed insurmountable at first, but with determination and community support, I slowly found my footing.</p><p>Every small victory - from ordering coffee in English to landing my first job - became a milestone worth celebrating.</p>",
        type: "text",
        thumbnail: "/bloghero.png",
        status: "published",
        isFeatured: true,
        dateCreated: "12/05/2025",
        lastUpdated: "12/05/2025",
        author: "Zhang Mei" // Added author field
    },
    {
        id: "12346",
        title: "Building Bridges: Community Connection Stories",
        summary: "How local communities came together to support new immigrants during challenging times.",
        content:
            "<p>In our neighborhood, we discovered that <em>connection transcends language</em>. When Mrs. Chen moved in next door, we communicated through smiles, gestures, and shared meals.</p><p>These simple acts of kindness created lasting friendships that enriched all our lives.</p>",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnail: "/woman-profile.png",
        isFeatured: false,
        status: "draft",
        dateCreated: "12/05/2025",
        lastUpdated: "12/05/2025",
        author: "Community Writer" // Added author field
    },
]

export const initialBlogs1: Blog[] = [
    {
        id: "12347",
        title: "Navigating Cultural Identity in a New Home",
        author: "Amina Khan",
        summary: "Exploring the balance between preserving heritage and embracing new traditions.",
        content: "Cultural identity becomes more complex when you're living between two worlds. This blog explores how immigrants navigate the delicate balance of honoring their heritage while embracing their new home.",

        // description:
        // "A ?thoughtful exploration of maintaining cultural roots while adapting to life in a new country, featuring personal stories and practical advice.",
        // content: {
        //     introduction:
        //         "Cultural identity becomes more complex when you're living between two worlds. This blog explores how immigrants navigate the delicate balance of honoring their heritage while embracing their new home.",
        //     sections: [
        //         {
        //             title: "Preserving Traditions",
        //             content:
        //                 "Keeping cultural traditions alive requires intentional effort. From cooking traditional meals to celebrating cultural holidays, these practices serve as anchors to our roots while sharing our heritage with new communities.",
        //         },
        //         {
        //             title: "Embracing Change",
        //             content:
        //                 "Adaptation doesn't mean abandonment. Learning new customs and traditions can enrich our lives while adding layers to our identity. The key is finding harmony between old and new.",
        //         },
        //     ],
        //     closingThoughts:
        //         "Cultural identity is not fixed but evolving. Embracing this fluidity allows us to grow while staying connected to who we are.",
        // },
        category: "Lifestyle",
        type: "text",
        // image: "/bloghero.png",
        thumbnail: "/bloghero.png",
        isFeatured: true,
        status: "published",
        dateCreated: "12/05/2025",
        lastUpdated: "12/05/2025",
    },
    {
        id: "12348",
        title: "Language Learning Tips for Adult Immigrants",
        author: "Jane Smith",
        summary: "Practical strategies for mastering a new language later in life.",
        content: "Cultural identity becomes more complex when you're living between two worlds. This blog explores how immigrants navigate the delicate balance of honoring their heritage while embracing their new home.",
        // description:
        // "Comprehensive guide with proven techniques, resources, and encouragement for adult language learners in immigrant communities.",
        // content: {
        //     introduction:
        //         "Learning a new language as an adult presents unique challenges, but with the right approach and mindset, it's absolutely achievable. This guide shares practical strategies that have helped thousands of immigrants succeed.",
        //     sections: [
        //         {
        //             title: "Start with Daily Conversations",
        //             content:
        //                 "Focus on phrases you'll use every day - grocery shopping, asking for directions, workplace interactions. Practice these until they become automatic, building confidence for more complex conversations.",
        //         },
        //         {
        //             title: "Immerse Yourself Gradually",
        //             content:
        //                 "Begin with children's books and simple TV shows, gradually increasing complexity. Join community groups where you can practice in a supportive environment without fear of judgment.",
        //         },
        //     ],
        //     closingThoughts:
        //         "Remember, every expert was once a beginner. Be patient with yourself and celebrate small victories along the way.",
        // },

        category: "Community",
        type: "audio",
        audioFile: "/placeholder.mp3",
        // image: "/woman-profile.png",
        thumbnail: "/woman-profile.png",
        status: "draft",
        isFeatured: false,
        dateCreated: "12/05/2025",
        lastUpdated: "12/05/2025",
    },
]

export const blogCategories = ["Lifestyle", "Community", "Education", "Culture", "Career"]
