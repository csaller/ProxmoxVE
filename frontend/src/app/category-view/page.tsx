"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Category } from "@/lib/types";

const defaultLogo = "/default-logo.png"; // Fallback logo path
const MAX_DESCRIPTION_LENGTH = 100; // Set max length for description
const MAX_LOGOS = 5; // Max logos to display at once

const CategoryView = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const basePath = process.env.NODE_ENV === "production" ? "/ProxmoxVE" : "";
        const response = await fetch(`${basePath}/api/categories`);
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        console.log("Fetched categories:", data); // Debugging
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (index: number) => {
    setSelectedCategoryIndex(index);
  };

  const handleBackClick = () => {
    setSelectedCategoryIndex(null);
  };

  const handleScriptClick = (scriptSlug: string) => {
    router.push(`/scripts?id=${scriptSlug}`);
  };

  const navigateCategory = (direction: "prev" | "next") => {
    if (selectedCategoryIndex !== null) {
      const newIndex =
        direction === "prev"
          ? (selectedCategoryIndex - 1 + categories.length) % categories.length
          : (selectedCategoryIndex + 1) % categories.length;
      setSelectedCategoryIndex(newIndex);
    }
  };

  const truncateDescription = (text: string) => {
    return text.length > MAX_DESCRIPTION_LENGTH
      ? `${text.slice(0, MAX_DESCRIPTION_LENGTH)}...`
      : text;
  };

  const renderResources = (script: any) => {
    const cpu = script.install_methods[0]?.resources.cpu;
    const ram = script.install_methods[0]?.resources.ram;
    const hdd = script.install_methods[0]?.resources.hdd;

    const resourceParts = [];
    if (cpu) resourceParts.push(<span key="cpu"><b>CPU:</b> {cpu}vCPU</span>);
    if (ram) resourceParts.push(<span key="ram"><b>RAM:</b> {ram}MB</span>);
    if (hdd) resourceParts.push(<span key="hdd"><b>HDD:</b> {hdd}GB</span>);

    return resourceParts.length > 0 ? (
      <div className="text-sm text-gray-400">
        {resourceParts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < resourceParts.length - 1 && " | "}
          </React.Fragment>
        ))}
      </div>
    ) : null;
  };

  const renderType = (type: string) => {
    return (
      <span className="text-xs font-semibold text-blue-500 bg-gray-200 px-2 py-1 rounded-full">
        {type.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="p-6 mt-20">
      {categories.length === 0 && (
        <p className="text-center text-gray-500">No categories available. Please check the API endpoint.</p>
      )}
      {selectedCategoryIndex !== null ? (
        <div>
          {/* Header with Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigateCategory("prev")}
              className="p-2"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <h2 className="text-3xl font-semibold">{categories[selectedCategoryIndex].name}</h2>
            <Button
              variant="ghost"
              onClick={() => navigateCategory("next")}
              className="p-2"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Scripts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {categories[selectedCategoryIndex].scripts
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((script) => (
                <Card
                  key={script.name}
                  className="p-4 cursor-pointer"
                  onClick={() => handleScriptClick(script.slug)}
                >
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-bold">{script.name}</h3>
                      {renderType(script.type || "MISC")}
                    </div>
                    <p className="text-sm text-gray-500">
                      <b>Created at:</b> {script.date_created || "No date available"}
                    </p>
                    <p
                      className="text-sm text-gray-700 hover:text-gray-900"
                      title={script.description || "No description available."}
                    >
                      {truncateDescription(script.description || "No description available.")}
                    </p>
                    {renderResources(script)}
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Back to Categories Button */}
          <div className="mt-8 text-center">
            <Button
              variant="default"
              onClick={handleBackClick}
              className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition"
            >
              Back to Categories
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {/* Categories Grid */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold mb-4">Categories</h1>
            <p className="text-sm text-gray-500">
              {new Set(categories.flatMap((cat) => cat.scripts.map((s) => s.slug))).size} Total scripts
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Card
                key={category.name}
                onClick={() => handleCategoryClick(index)}
                className="cursor-pointer hover:shadow-lg flex flex-col items-center justify-center py-6"
              >
                <CardContent className="flex flex-col items-center">
                  <h3 className="text-xl font-bold mb-4">{category.name}</h3>
                  <div className="flex justify-center gap-2 mb-4">
                    {category.scripts &&
                      category.scripts.slice(0, 5).map((script, i) => (
                        <img
                          key={i}
                          src={script.logo || defaultLogo}
                          alt={script.name || "Script logo"}
                          title={script.name} // Hover zeigt den Scriptnamen an
                          className="h-8 w-8 object-contain cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation(); // Verhindert Klick auf die Kategorie
                            handleScriptClick(script.slug);
                          }}
                        />
                      ))}
                  </div>
                  <p className="text-sm text-gray-400 text-center">
                    {(category as any).description || "No description available."}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryView;
