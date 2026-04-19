import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import "./Navigator.css";

function Navigator() {
  const location = useLocation();
  const PDComponents = [
    {
      title: "Gene Search",
      href: "/gene-search",
      description:
        "Browse the NCBI gene sequence with either gene name or ascession",
    },
    {
      title: "Mutation Manager",
      href: "/mutations",
      description: "Edit mutations associated with selected gene",
    },
    {
      title: "Primer Design",
      href: "/primer-design",
      description:
        "Get appropritate primer pairs for your chosen gene sequence",
    },
  ];

  const CVComponents = [
    {
      title: "In construction",
      href: "In construction",
      description: "In construction",
    },
  ];

  return (
    <div className="w-full bg-blue-500 border-b-2 border-blue-800 z-50 h-12">
      <div className="container mx-auto h-full">
        <NavigationMenu className="h-full items-center justify-start">
          <NavigationMenuList className="flex flex-row space-x-2 h-full items-center px-2">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-blue-500 hover:bg-blue-700 hover:font-bold data-[state=open]:bg-blue-700 data-[state=open]:font-bold text-white">
                Primer Designer
              </NavigationMenuTrigger>
              <NavigationMenuContent className="w-lg rounded-md shadow-lg bg-white">
                <ul className="p-2">
                  {PDComponents.map((component) => (
                    <ListItem
                      key={component.title}
                      title={component.title}
                      href={component.href}
                      isActive={location.pathname === component.href}
                    >
                      {component.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-blue-500 hover:bg-blue-700 hover:font-bold data-[state=open]:bg-blue-700 data-[state=open]:font-bold text-white">
                Cross Validation
              </NavigationMenuTrigger>
              <NavigationMenuContent className="w-lg rounded-md shadow-lg bg-white">
                <ul className="p-2">
                  {CVComponents.map((component) => (
                    <ListItem
                      key={component.title}
                      title={component.title}
                      href={component.href}
                      isActive={location.pathname === component.href}
                    >
                      {component.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}

export default Navigator;

function ListItem({ title, children, href, isActive, ...props }) {
  return (
    <li
      className={`list-none ${isActive ? "opacity-50 pointer-events-none" : ""}`}
      {...props}
    >
      <NavigationMenuLink asChild>
        <Link
          to={href}
          className="block p-2 rounded-md transition-colors hover:bg-blue-200 focus:bg-blue-200"
        >
          <div className="flex flex-col gap-1 text-sm">
            <div className="leading-none font-medium text-black">{title}</div>
            <div className="line-clamp-2 text-gray-500">{children}</div>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
