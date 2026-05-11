import { useRef, useEffect } from "react";
import { Layout, theme, Flex } from "antd";
import { Outlet, useLocation } from "@tanstack/react-router";
import { Sidebar } from "../Sidebar";
import { Header } from "../Header";

const { Content } = Layout;

export function MainLayout() {
  const { token } = theme.useToken();
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Flex
        vertical
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: "100vh",
        }}
      >
        <Header />
        <Content
          ref={contentRef}
          className="main-layout-main"
          style={{
            flex: 1,
            padding: token.paddingLG,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
          }}
        >
          <Outlet />
        </Content>
      </Flex>
    </Layout>
  );
}
