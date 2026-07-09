/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router";
import { useEffect, useState } from "react";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Shop } from "./pages/Shop";
import { BookDetail } from "./pages/BookDetail";

import { Cart } from "./pages/Cart";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { PublishBook } from "./pages/PublishBook";
import { Admin } from "./pages/Admin";
import { Profile } from "./pages/Profile";

// Simple placeholders for pages not fully built yet to save tokens
const Blog = () => <div className="max-w-7xl mx-auto p-12 text-center text-xl font-serif">المدونة - قيد التطوير</div>;
const Checkout = () => <div className="max-w-7xl mx-auto p-12 text-center text-xl font-serif">إتمام الطلب - قيد التطوير</div>;

const Activities = () => <div className="max-w-7xl mx-auto p-12 text-center text-xl font-serif">الأنشطة - قيد التطوير</div>;
const AboutPublishing = () => <div className="max-w-7xl mx-auto p-12 text-center text-xl font-serif">حول النشر - قيد التطوير</div>;
const Offers = () => <div className="max-w-7xl mx-auto p-12 text-center text-xl font-serif">عروض - قيد التطوير</div>;

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const res = await fetch(`/api/users/profile/${currentUser.uid}`);
          if (res.ok) {
            const data = await res.json();
            setDbUser(data.data || data);
          }
        } catch (e) {
          console.error("Failed to fetch user profile", e);
        }
      } else {
        setDbUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Layout user={user} dbUser={dbUser}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/about-publishing" element={<AboutPublishing />} />
          <Route path="/publish-book" element={<PublishBook />} />
          <Route path="/admin" element={<Admin dbUser={dbUser} />} />
          <Route path="/profile" element={<Profile user={user} dbUser={dbUser} />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
