import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, ShieldCheck, TrendingUp, Users, ArrowRight, Sprout } from 'lucide-react';

const HomePage = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative bg-primary-50 py-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="md:w-2/3 lg:w-1/2"
                    >
                        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                            Earning <span className="text-primary-600">Trust</span> & <span className="text-primary-600">Growth</span> for Farmers
                        </h1>
                        <p className="mt-6 text-xl text-gray-600 max-w-lg">
                            Farm Earn connects farmers directly with buyers through a secure, verified digital marketplace. Real crops, real verification, real profit.
                        </p>
                        <div className="mt-10 flex space-x-4">
                            <Link to="/login" className="btn-primary flex items-center px-8 py-4 text-lg">
                                Get Started <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link to="/marketplace" className="btn-outline flex items-center px-8 py-4 text-lg">
                                Browse Crops
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Subtle background graphic */}
                <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 hidden lg:block">
                    <Sprout className="w-full h-full text-primary-600" />
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">How It Works</h2>
                        <p className="mt-4 text-lg text-gray-600">A professional ecosystem designed for agricultural transparency.</p>
                    </div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {[
                            { icon: <Users />, title: "Join as Member", desc: "Sign in as a Farmer, Buyer, or Agent." },
                            { icon: <Sprout />, title: "List Your Crop", desc: "Farmers upload crop details and high-quality images." },
                            { icon: <ShieldCheck />, title: "Agent Verification", desc: "Professional agents verify the quality and status." },
                            { icon: <ShoppingCart />, title: "Secure Purchase", desc: "Buyers purchase verified crops with confidence." }
                        ].map((feature, index) => (
                            <motion.div key={index} variants={itemVariants} className="card p-8 flex flex-col items-center text-center hover:translate-y-[-4px] transition-transform">
                                <div className="h-14 w-14 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-primary-600 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white font-bold">
                        <div><p className="text-4xl">5k+</p><p className="text-primary-100 font-medium">Farmers</p></div>
                        <div><p className="text-4xl">10k+</p><p className="text-primary-100 font-medium">Tons Sold</p></div>
                        <div><p className="text-4xl">1.2k+</p><p className="text-primary-100 font-medium">Agents</p></div>
                        <div><p className="text-4xl">98%</p><p className="text-primary-100 font-medium">Satisfaction</p></div>
                    </div>
                </div>
            </section>

            {/* Testimonials Placeholder */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-12">Farmer Success Stories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="card p-6 italic">"Farm Earn helped me reach buyers across the state. My profits increased by 40% this season." - Rajesh K.</div>
                        <div className="card p-6 italic">"The agent verification gives buyers confidence. I sold my entire wheat harvest in 3 days!" - Sunita M.</div>
                        <div className="card p-6 italic">"Clean UI and super fast. Best platform for Indian agriculture today." - Amit P.</div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gray-900 py-20">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl text-white font-bold mb-6 text-white">Ready to digitize your agricultural trade?</h2>
                    <Link to="/login" className="btn-primary px-10 py-5 text-xl inline-block">Join Farm Earn Now</Link>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
