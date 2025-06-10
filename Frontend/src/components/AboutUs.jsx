import React from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaUserAlt, FaGlobe } from 'react-icons/fa';
import romi from "../assets/romi.jpg";
import yubina from "../assets/yubina.jpg";
import { NavLink } from 'react-router-dom';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">

      {/* Our Mission */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900">Our Mission</h2>
          <p className="text-gray-600 mt-4 max-w-3xl mx-auto text-lg">
            At BookHauls, we're dedicated to making books accessible and fostering a global community of passionate readers.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: FaBook, title: 'Discover', desc: 'Uncover your next favorite book with personalized recommendations.' },
            { icon: FaUserAlt, title: 'Connect', desc: 'Engage with a vibrant global community of book enthusiasts.' },
            { icon: FaGlobe, title: 'Share', desc: 'Share your love for literature and inspire others worldwide.' },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-lg p-8 text-center transform hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <feature.icon className="text-indigo-600 text-5xl mb-6 mx-auto" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-16 bg-gradient-to-t from-gray-50 to-white rounded-t-3xl shadow-inner">
        <div className="text-center mb-12 max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900">Meet Our Team</h2>
          <p className="text-gray-600 mt-4 max-w-3xl mx-auto text-lg">
            Meet the passionate individuals crafting the ultimate literary experience for you.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto px-6">
          {[
            { name: 'Romi Limbu', role: 'Web Developer', image: romi },
            { name: 'Yubina Subedi', role: 'Designer', image: yubina },
          ].map((teamMember, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-lg p-8 text-center transform hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <img
                src={teamMember.image}
                alt={teamMember.name}
                className="rounded-full h-40 w-40 object-cover mx-auto mb-6 border-4 border-indigo-100"
              />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">{teamMember.name}</h3>
              <p className="text-indigo-600 font-medium">{teamMember.role}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutUs;