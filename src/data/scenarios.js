export const scenarios = [
  // Business Pressure Scenarios
  {
    id: "bus-1",
    title: "Enterprise Feature Creep",
    category: "Business Pressure",
    difficulty: "senior",
    scenario: `Your team is building a productivity app that has found success with small businesses. Now, the sales team has secured interest from several Fortune 500 companies, but they're demanding 15 enterprise-specific features including advanced admin controls, SAML SSO, detailed audit logs, and complex permission structures. The CEO is excited about the potential revenue and wants these features delivered in the next quarter.

    Your user research shows that 85% of your current users love the product specifically because it's simple and easy to use. Adding these enterprise features would require significant changes to the navigation and core user flows. The engineering team estimates it would take 6 months to properly implement all requested features, but the sales team has already promised delivery in 3 months.

    You're in a meeting with the CEO, Head of Sales, and Head of Engineering. The CEO turns to you and asks, "How do we make this work without losing our existing user base?" What do you do?`
  },
  {
    id: "bus-2",
    title: "Monetization vs Trust",
    category: "Business Pressure",
    difficulty: "senior",
    scenario: `Your mental health app has 2 million active users who trust you with their deeply personal journal entries and mood tracking data. The company is burning through runway and needs to become profitable within 6 months. The board is pushing for a new monetization strategy: partnering with pharmaceutical companies to show "relevant wellness products" based on users' mental health patterns.

    The data science team has already built a prototype that can identify users likely to be interested in specific medications based on their journal entries. The potential revenue is substantial - enough to make the company profitable immediately. The legal team says it's technically allowed under your current privacy policy, though users would need to opt-in to "personalized recommendations."

    Initial user research suggests that even mentioning pharmaceutical partnerships could damage user trust significantly. Your CEO is under pressure from investors and asks you to design an implementation that "preserves user trust while maximizing revenue potential." What do you do?`
  },
  {
    id: "bus-3",
    title: "Sales Promises vs User Reality",
    category: "Business Pressure",
    difficulty: "mid",
    scenario: `The sales team has been struggling to close deals and has started making promises about upcoming features without consulting the product team. You discover they've promised five different enterprise clients contradictory features: Client A wants all data stored in the US only, Client B needs EU-only storage, Client C demands on-premise deployment, Client D requires deep Salesforce integration, and Client E needs custom branding throughout the entire app.

    Each client represents about $500K in annual revenue. Your current architecture doesn't support any of these requirements easily. The engineering team is already stretched thin working on the core product roadmap, which focuses on improving the experience for your 50,000 existing SMB customers who generate 80% of current revenue.

    The Head of Sales has scheduled a meeting and says, "We need these features to hit our numbers. Can't we just figure it out?" The engineering lead looks exhausted. What do you do?`
  },
  {
    id: "bus-4",
    title: "Competing User Segments",
    category: "Business Pressure",
    difficulty: "mid",
    scenario: `Your video editing app serves two distinct user segments: professional video editors who need advanced features and precise control, and social media creators who want quick, template-based editing. The pro users (20% of users) generate 60% of revenue through subscriptions, while creators (80% of users) drive growth and virality but mostly use the free tier.

    You've been asked to redesign the main editing interface. The pro users are complaining that the app is becoming "too dumbed down" and are threatening to switch to competitors. Meanwhile, user research with creators shows they find even the current interface intimidating and want something simpler. You have resources for one major redesign, not two separate interfaces.

    The board meeting is tomorrow, and you need to present your recommendation. The CEO has made it clear that both retaining revenue and maintaining growth are critical. What do you do?`
  },
  {
    id: "bus-5",
    title: "Technical Debt vs User Needs",
    category: "Business Pressure",
    difficulty: "senior",
    scenario: `Your fintech app's backend is built on technology from 2015. While it works, the technical debt is mounting: payment processing takes 5-10 seconds, the app crashes for 1% of users daily, and you can't implement modern features like real-time notifications or biometric authentication. Users are increasingly complaining, and your app store rating has dropped from 4.5 to 3.8 stars in the past six months.

    The engineering team wants to spend the next 6 months rebuilding the backend infrastructure. During this time, they could only handle critical bug fixes, no new features. Meanwhile, your main competitor just launched instant peer-to-peer payments and a slick new budgeting feature. Your user research shows these are the top two requested features.

    The board is concerned about losing market share and wants to see new features shipped ASAP. The engineering director warns that continuing without addressing technical debt could lead to a major security incident. You're asked to make the call. What do you do?`
  },

  // Political/Organizational Scenarios
  {
    id: "pol-1",
    title: "The Executive End-Run",
    category: "Political/Organizational",
    difficulty: "senior",
    scenario: `You've spent three months working with your team on a complete redesign of your app's onboarding flow. User research showed the current 7-step process caused 60% drop-off, and your new 3-step design tested brilliantly with users. You're one week from launch when the CEO's spouse (who "has a background in marketing") sends an email to the entire C-suite with their own mockups for onboarding.

    Their design includes motivational quotes, requires users to set "life goals" before accessing the app, and adds 12 screens to the flow. The CEO loves it and forwards the email to you with "Let's do this instead. Much more inspiring!" The engineering team has already built your design. Your user researcher is furious. The launch date can't move due to a major marketing campaign.

    You have a meeting with the CEO in an hour. They've also invited their spouse to "share more ideas." What do you do?`
  },
  {
    id: "pol-2",
    title: "Research Rejection",
    category: "Political/Organizational",
    difficulty: "mid",
    scenario: `You've just completed extensive user research on a new feature, including 30 user interviews, survey data from 1,000 users, and usability testing with 15 participants. The research clearly shows users want solution A. However, the Head of Product, who just joined from a competitor, insists on implementing solution B because "it worked great at my last company."

    When you present the research findings, they respond with "I don't trust research. Users don't know what they want. I've been doing this for 15 years." They've already promised the board that solution B will ship next month and have started socializing it as their first big win at the company.

    Your team is demoralized. The engineers are confused about which direction to build. The Head of Product is your boss's boss. What do you do?`
  },
  {
    id: "pol-3",
    title: "The Growth Team's Dark Patterns",
    category: "Political/Organizational",
    difficulty: "senior",
    scenario: `The growth team has been celebrated for increasing user acquisition by 200% and reducing churn by 40%. You discover they've implemented several dark patterns: hidden unsubscribe buttons, confusing cancellation flows that trick users into pausing instead of canceling, and pre-checked boxes for expensive add-ons during checkout. They've also been automatically re-activating cancelled accounts after 30 days "in case users changed their mind."

    These tactics are generating an extra $2M in monthly revenue. However, customer complaints are rising, and you've noticed angry social media posts gaining traction. The growth team lead, who reports directly to the CEO, defends these as "industry standard practices" and points to the improved metrics.

    You're asked to redesign the cancellation flow to be "even more effective." The growth team has significant political power due to their recent wins. What do you do?`
  },
  {
    id: "pol-4",
    title: "Design by Committee Override",
    category: "Political/Organizational",
    difficulty: "mid",
    scenario: `You and your team spent two months creating a cohesive design system and new visual design for your product. It tested well with users and would significantly improve usability and brand perception. The day before implementation begins, the CMO calls an emergency meeting with all C-suite executives to "get final approval."

    In the meeting, each executive has strong opinions: the CFO wants more "enterprise-looking" colors (gray and navy), the CTO insists on keeping the old navigation because "change is risky," and the COO wants to add their favorite purple as the primary color. By the end, your clean, tested design has been transformed into a Frankenstein creation that satisfies no one but includes everyone's pet preferences.

    The CEO concludes with "Great collaboration everyone! Ship this version." Your lead designer is considering quitting. The engineers are confused about what to build. What do you do?`
  },
  {
    id: "pol-5",
    title: "Cross-Team Feature War",
    category: "Political/Organizational",
    difficulty: "senior",
    scenario: `The mobile team and web team have been operating in silos, each building features without coordinating. This has led to completely different experiences: the mobile app has swipe gestures and a card-based interface, while the web app uses traditional navigation and tables. Users are confused and frustrated when switching between platforms.

    You propose creating a unified experience, but both teams resist. The mobile team lead says, "Web constraints will ruin our innovative mobile experience." The web team lead argues, "Mobile-first design doesn't work for our power users who need information density." Both teams report to different VPs who are in a political battle for resources and headcount.

    Meanwhile, your competitor just launched a seamlessly consistent cross-platform experience and is gaining market share. The CEO wants a solution but doesn't want to upset either VP. You're caught in the middle. What do you do?`
  },

  // Ethical/Data Interpretation Scenarios
  {
    id: "eth-1",
    title: "The Engagement Trap",
    category: "Ethical/Data Interpretation",
    difficulty: "senior",
    scenario: `Your social media app's new AI-driven feed algorithm has been wildly successful. Engagement is up 80%, daily active users increased by 60%, and average session time has doubled to 2.5 hours per day. The data team is ecstatic, and the company valuation has increased significantly based on these metrics.

    However, you start noticing concerning patterns in the qualitative data. User interviews reveal people feeling "addicted" and "unable to stop scrolling." Parents report their teenagers staying up until 3 AM on the app. Support tickets include phrases like "ruining my life" and "can't focus on work anymore." The algorithm seems particularly effective at showing controversial content that triggers emotional responses.

    A prominent tech journalist is preparing an exposé on addictive app design and has reached out for comment. The CEO wants to tout your engagement metrics in the upcoming earnings call. The data clearly shows business success, but the human impact seems negative. What do you do?`
  },
  {
    id: "eth-2",
    title: "The Data Paradox",
    category: "Ethical/Data Interpretation",
    difficulty: "mid",
    scenario: `Your fitness app's data shows an interesting paradox. Quantitative metrics are fantastic: users who get push notifications exercise 50% more, log meals 3x more frequently, and have 70% better retention. The business team wants to increase notification frequency from 3 to 8 times per day based on this data.

    However, user interviews tell a different story. Many users say the notifications make them feel guilty and anxious. Some report developing unhealthy relationships with exercise, working out even when injured. Others mention feeling "harassed" by the app but being unable to turn off notifications for fear of "falling off the wagon." Several users admitted they sometimes lie in their logs just to make the notifications stop.

    The health team argues more engagement means better health outcomes. The data supports increasing notifications for business metrics. But the qualitative feedback suggests potential harm. What do you do?`
  },
  {
    id: "eth-3",
    title: "Accessibility vs Deadline",
    category: "Ethical/Data Interpretation",
    difficulty: "mid",
    scenario: `Your team is launching a new government services portal that will be the primary way citizens apply for unemployment benefits, food assistance, and healthcare. You're two weeks from the federally mandated launch date. The accessibility audit just came back with 147 violations, including critical issues that make the site unusable for screen reader users and those with motor disabilities.

    Fixing all accessibility issues properly would take at least 6 weeks. The project manager suggests launching with a "text-only accessible version" on a separate URL as a temporary solution. The government contract is worth $10M annually to your company. Missing the deadline means significant penalties and possibly losing the contract. 

    You know that approximately 15% of users who need these services have disabilities. The "separate but equal" approach has been legally challenged in the past. The engineering team is already working overtime. What do you do?`
  },
  {
    id: "eth-4",
    title: "Privacy Theater",
    category: "Ethical/Data Interpretation",
    difficulty: "senior",
    scenario: `Your company wants to launch a new "Privacy Dashboard" to address growing user concerns about data collection. The marketing team has written compelling copy about "putting users in control" and "transparent data practices." The dashboard would show users what data is collected and provide toggles to "control" their privacy.

    However, you discover that the toggles are largely theatrical. Turning off "behavioral tracking" only stops 20% of actual tracking due to "technical requirements." The "delete my data" button only removes data from primary databases, not from backups, analytics systems, or third-party integrations. The legal team says this is all technically compliant with privacy laws due to carefully worded disclaimers.

    User research shows that 90% of users would believe they have full control after using the dashboard. The CEO sees this as a perfect solution - users feel empowered while business continues as usual. What do you do?`
  },
  {
    id: "eth-5",
    title: "The A/B Test Dilemma",
    category: "Ethical/Data Interpretation",
    difficulty: "senior",
    scenario: `Your e-learning platform ran an A/B test on pricing strategies for your premium tutoring service. Version A showed the actual price ($50/hour). Version B showed a "discounted" price of $50/hour crossed out from a fake "original" price of $100/hour. Version B increased conversions by 85% and generated 3x more revenue.

    The twist: your platform primarily serves low-income families trying to help their children succeed academically. Many are spending money they can't afford because they believe they're getting a great deal. Customer service reports increased complaints about financial hardship, and some families are going into debt. However, students using the premium service show 40% better learning outcomes.

    The CFO wants to roll out Version B immediately, arguing that it helps more students access better education. The data clearly shows business success and improved educational outcomes. But the manipulation feels wrong, especially given your vulnerable user base. What do you do?`
  }
];