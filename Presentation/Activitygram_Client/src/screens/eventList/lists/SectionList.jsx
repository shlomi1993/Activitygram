import React from "react";
import { KeyboardAvoidingView, SafeAreaView, StyleSheet } from "react-native";
import { Appbar, List, Subheading } from "react-native-paper";
import { StatusBar } from "expo-status-bar";

import BigList from "react-native-big-list";
import sections from "../data/sectionsList.json";
import Block from "./components/EventListBlock";

export default function SectionList() {
  const renderItem = ({ item }) => {
    return (
      <List.Item
        title={item.title}
        description={item.description}
        style={styles.container}
        left={(props) => <List.Icon {...props} icon="account" />}
      />
    );
  };
  const renderEmpty = () => <List.Item title="No items" />;
  const renderHeader = () => (
    <List.Item
      title="Marco Cesarato"
      description="cesarato.developer@gmail.com"
      style={styles.container}
      left={(props) => <List.Icon {...props} icon="account" />}
    />
  );
  const renderFooter = () => (
    <Block>
      <Subheading>No more items available...</Subheading>
    </Block>
  );
  const renderSectionHeader = (section) => (
    <Appbar style={styles.header}>
      <Appbar.Content
        style={styles.headerContent}
        title={"Section " + (section + 1)}
        subtitle="Below are listed all section items"
      />
    </Appbar>
  );
  const renderSectionFooter = (section) => (
    <Block>
      <Subheading>Footer Section {section}</Subheading>
    </Block>
  );
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.container}>
        <BigList
          style={styles.container}
          sections={sections}
          // Item
          itemHeight={90}
          renderItem={renderItem}
          renderEmpty={renderEmpty}
          // Header
          headerHeight={90}
          renderHeader={renderHeader}
          // Footer
          footerHeight={100}
          renderFooter={renderFooter}
          // Section
          sectionHeaderHeight={75}
          renderSectionHeader={renderSectionHeader}
          // Section footer
          sectionFooterHeight={60}
          renderSectionFooter={renderSectionFooter}
        />
        <StatusBar style="auto" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: { elevation: 0, height: 50 },
  headerContent: { alignItems: "center", height: 50, justifyContent: "center" },
});