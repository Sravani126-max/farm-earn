import { Users, Lightbulb, Target } from 'lucide-react';

const AboutPage = () => {
    const team = [
        {
            name: "Sattenapalli Bhanu Prakesh",
            role: "Founder",
            icon: <Target className="h-10 w-10 text-primary-600" />,
            description: "Driving the vision of Farm Earn to revolutionize digital agriculture."
        },
        {
            name: "Venkata Ramaiah Marupudi",
            role: "Ideator",
            icon: <Lightbulb className="h-10 w-10 text-blue-600" />,
            description: "Conceptualized the core ideas behind empowering farmers digitally."
        },
        {
            name: "Talla Pavan Kumar",
            role: "Ideator",
            icon: <Users className="h-10 w-10 text-green-600" />,
            description: "Building the foundation of trust and collaboration in our ecosystem."
        },
        {
            name: "Jyothi",
            role: "Crew Member",
            icon: <Users className="h-10 w-10 text-purple-600" />,
            description: "Dedicated to supporting and scaling the Farm Earn platform daily."
        },
        {
            name: "Manikanta",
            role: "Crew Member",
            icon: <Users className="h-10 w-10 text-orange-600" />,
            description: "Bringing operational excellence to the Farm Earn mission."
        },
        {
            name: "Madhav",
            role: "Crew Member",
            icon: <Users className="h-10 w-10 text-teal-600" />,
            description: "Ensuring high-quality execution for our agricultural community."
        }
    ];

    return (
        <div className="bg-white min-h-[calc(100vh-4rem)]">
            {/* Header Section */}
            <header className="bg-primary-50 py-20 text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">About Farm Earn</h1>
                    <p className="text-xl text-gray-600">
                        We are bridging the gap between agriculture and technology, bringing farmers, agents, and buyers into a seamless and transparent digital marketplace.
                    </p>
                </div>
            </header>

            {/* Team Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">Meet The Core Team</h2>
                        <p className="mt-4 text-lg text-gray-600">The minds behind Farm Earn.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {team.map((member, index) => (
                            <div key={index} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-shadow p-8 text-center flex flex-col items-center">
                                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                    {member.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">{member.name}</h3>
                                <p className="text-primary-600 font-semibold mb-4 tracking-wide uppercase text-sm mt-2">{member.role}</p>
                                <p className="text-gray-600 leading-relaxed">
                                    {member.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="bg-gray-900 py-20 text-white text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                    <p className="text-xl text-gray-300">
                        To empower the agricultural community by providing a secure, verified, and highly profitable marketplace that removes middlemen and brings farmers directly to the market.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
