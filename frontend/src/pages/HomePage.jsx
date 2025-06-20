import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Truck,
  Package,
  Star,
  Shield,
  Users,
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  Globe,
} from "lucide-react";

import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import FeatureCard from "../components/common/FeatureCard.jsx";
import StatCard from "../components/common/StatCard.jsx";
import TestimonialCard from "../components/common/TestimonialCard.jsx";

const HomePage = () => {
  const location = useLocation();

  // Handle anchor links when page loads
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  const features = [
    {
      icon: Truck,
      title: "Conducteurs Vérifiés",
      description:
        "Conducteurs professionnels avec véhicules contrôlés et assurés",
      color: "blue",
    },
    {
      icon: Package,
      title: "Expédition Sécurisée",
      description:
        "Suivi en temps réel et assurance complète de vos marchandises",
      color: "orange",
    },
    {
      icon: Shield,
      title: "Paiement Sécurisé",
      description: "Transactions sécurisées avec garantie de livraison",
      color: "green",
    },
    {
      icon: Users,
      title: "Communauté Active",
      description: "Plus de 10,000 utilisateurs actifs dans toute la France",
      color: "blue",
    },
  ];

  const stats = [
    { number: "15,000+", label: "Livraisons réalisées", icon: Package },
    { number: "5,000+", label: "Conducteurs actifs", icon: Truck },
    { number: "98%", label: "Satisfaction client", icon: Star },
    { number: "24/7", label: "Support disponible", icon: CheckCircle },
  ];

  const testimonials = [
    {
      name: "Marie Dubois",
      role: "Expéditrice",
      content:
        "TransportConnect m'a permis d'expédier mes produits artisanaux dans toute la France. Service excellent !",
      rating: 5,
      avatar: "MD",
    },
    {
      name: "Pierre Martin",
      role: "Conducteur",
      content:
        "Grâce à cette plateforme, j'optimise mes trajets et j'aide les expéditeurs. Win-win !",
      rating: 5,
      avatar: "PM",
    },
    {
      name: "Sophie Laurent",
      role: "Expéditrice",
      content:
        "Interface intuitive et conducteurs professionnels. Je recommande vivement !",
      rating: 5,
      avatar: "SL",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            🚀 Nouvelle plateforme de logistique
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-heading">
            Connectez
            <span className="bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
              {" "}
              Transporteurs
            </span>
            <br />
            et{" "}
            <span className="bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
              Expéditeurs
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            La première plateforme française qui révolutionne la logistique du
            transport de marchandises. Trouvez le transporteur idéal ou
            optimisez vos trajets en quelques clics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/auth?role=shipper"
              className="inline-flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
            >
              <Package className="mr-2 h-5 w-5" />
              Je suis Expéditeur
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

            <Link
              to="/auth?role=driver"
              className="inline-flex items-center border-2 border-blue-500 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all duration-200"
            >
              <Truck className="mr-2 h-5 w-5" />
              Je suis Conducteur
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-heading">
              Pourquoi choisir{" "}
              <span className="bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                TransportConnect
              </span>{" "}
              ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une plateforme conçue pour simplifier et sécuriser vos transports
              de marchandises
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="py-20 bg-gradient-to-br from-blue-50 via-blue-50 to-orange-50"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-heading">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Un processus simple en 3 étapes pour tous vos besoins de transport
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "Inscription et Profil",
                description:
                  "Créez votre compte et complétez votre profil selon votre rôle (conducteur ou expéditeur)",
                color: "blue",
              },
              {
                step: "2",
                title: "Publier ou Rechercher",
                description:
                  "Publiez une annonce de trajet ou recherchez le transporteur idéal pour vos marchandises",
                color: "orange",
              },
              {
                step: "3",
                title: "Transport et Évaluation",
                description:
                  "Effectuez le transport en toute sécurité et évaluez votre expérience pour la communauté",
                color: "green",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div
                  className={`w-16 h-16 bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto`}
                >
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-heading">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez les témoignages de notre communauté
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6 font-heading">
            Prêt à révolutionner vos transports ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez dès maintenant les milliers d'utilisateurs qui font
            confiance à TransportConnect
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-200"
          >
            Commencer maintenant
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
