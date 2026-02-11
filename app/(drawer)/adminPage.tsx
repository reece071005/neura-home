import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import * as mdi from "@mdi/js";
import MdiIcon from "@/components/MdiIcon";
import ConfirmDialog from "@/components/ConfirmDialog";

import Plus_Icon from "@/assets/icons/Plus_Icon.svg";

import { adminAddUser, adminDeleteUser, fetchAdminUsers, UserResponse } from "@/lib/api/admin";
import { getSystemOverview } from "@/lib/api/devices";

const AdminPage = () => {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    const [newEmail, setNewEmail] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newRole, setNewRole] = useState<"admin" | "user">("user");

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [totalDevices, setTotalDevices] = useState(0);
    const [totalSensors, setTotalSensors] = useState(0);
    const controllableDevices = totalDevices - totalSensors;
    const totalAutomations = 27;

    const resetAddForm = () => {
        setNewEmail("");
        setNewUsername("");
        setNewPassword("");
        setNewRole("user");
    };

    const loadUsers = useCallback(async () => {
        try {
            const data = await fetchAdminUsers();
            data.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
            setUsers(data);
        } catch (e: any) {
            Alert.alert("Error", e?.message ?? "Failed to load users");
        }
    }, []);

    const loadOverview = useCallback(async () => {
        try {
            const data = await getSystemOverview();
            setTotalDevices(data.totalDevices);
            setTotalSensors(data.totalSensors);
          } catch (e) {
            console.log("overview load failed", e);
          }
        }, []);

    useEffect(() => {
        (async () => {
            setLoading(true);
            await Promise.all([loadUsers(), loadOverview()]);
            setLoading(false);
        })();
    }, [loadUsers]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadUsers();
        setRefreshing(false);
    }, [loadUsers]);

    const formatCreatedAt = (iso: string) => {
        try {
            return new Date(iso).toLocaleString();
        } catch {
            return iso;
        }
    };

    const openAdd = () => {
        resetAddForm();
        setIsAddOpen(true);
    };

    const createUser = async () => {
        if (!newEmail.trim() || !newUsername.trim() || !newPassword.trim()) {
            Alert.alert("Missing info", "Email, username, and password are required.");
            return;
        }

        try {
            setCreating(true);
            await adminAddUser({
                email: newEmail.trim(),
                username: newUsername.trim(),
                password: newPassword,
                role: newRole,
            });

            setIsAddOpen(false);
            await loadUsers();
            Alert.alert("Success", "User created.");
        } catch (e: any) {
            Alert.alert("Create failed", e?.message ?? "Failed to create user");
        } finally {
            setCreating(false);
        }
    };

    const openDelete = (u: UserResponse) => {
        setDeleteTarget(u);
        setDeleteOpen(true);
    };

    const closeDelete = () => {
        setDeleteOpen(false);
        setDeleteTarget(null);
    };

    const onConfirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            setDeleting(true);
            await adminDeleteUser(deleteTarget.id);
            setUsers((prev) => prev.filter((x) => x.id !== deleteTarget.id));
         closeDelete();
        } catch (e: any) {
            Alert.alert("Delete failed", e?.message ?? "Failed to delete user");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
            {/* Add User Modal */}
            <Modal visible={isAddOpen} transparent animationType="fade" onRequestClose={() => setIsAddOpen(false)}>
                <View className="flex-1 items-center justify-center bg-black/40 px-6">
                    <View className="w-full rounded-2xl bg-white p-4">
                        <Text className="text-lg font-semibold text-black-900 mb-3">Create User</Text>

                        <Text className="text-xs text-gray-500 mb-1">Email</Text>
                        <TextInput
                            value={newEmail}
                            onChangeText={setNewEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            placeholder="user@example.com"
                            className="border border-gray-200 rounded-xl px-3 py-2 mb-3"
                        />

                        <Text className="text-xs text-gray-500 mb-1">Username</Text>
                        <TextInput
                            value={newUsername}
                            onChangeText={setNewUsername}
                            autoCapitalize="none"
                            placeholder="username"
                            className="border border-gray-200 rounded-xl px-3 py-2 mb-3"
                        />

                        <Text className="text-xs text-gray-500 mb-1">Password</Text>
                        <TextInput
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            placeholder="password"
                            className="border border-gray-200 rounded-xl px-3 py-2 mb-3"
                        />

                        <Text className="text-xs text-gray-500 mb-2">Role</Text>
                        <View className="flex-row gap-2 mb-4">
                            <Pressable
                                onPress={() => setNewRole("user")}
                                className={`flex-1 rounded-xl px-3 py-2 border ${newRole === "user" ? "border-black" : "border-gray-200"}`}
                            >
                                <Text className="text-center">User</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setNewRole("admin")}
                                className={`flex-1 rounded-xl px-3 py-2 border ${newRole === "admin" ? "border-black" : "border-gray-200"}`}
                            >
                                <Text className="text-center">Admin</Text>
                            </Pressable>
                        </View>

                        <View className="flex-row gap-2">
                            <Pressable
                                onPress={() => setIsAddOpen(false)}
                                disabled={creating}
                                className="flex-1 rounded-xl border border-gray-200 px-3 py-3"
                            >
                                <Text className="text-center">Cancel</Text>
                            </Pressable>

                            <Pressable
                                onPress={createUser}
                                disabled={creating}
                                className="flex-1 rounded-xl bg-black px-3 py-3"
                            >
                                {creating ? (
                                    <ActivityIndicator />
                                ) : (
                                    <Text className="text-center text-white">Create</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <ScrollView
                className="flex-1 px-4"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Header */}
                <View className="w-full py-4 mt-2 justify-center">
                    <Text className="absolute left-0 right-0 text-center text-2xl font-semibold text-black-900">
                        Admin Page
                    </Text>

                    {/* RIGHT BUTTON */}
                    <View className="flex-row justify-end">
                        <Pressable className="w-12 items-end justify-center mt-1" onPress={openAdd}>
                            <Plus_Icon width={32} height={32} />
                        </Pressable>
                    </View>
                </View>

                {/* Accounts Connected */}
                <View className="w-full items-start mt-2">
                    <Text className="text-lg font-semibold text-black-800">Accounts Connected</Text>
                </View>

                <View className="w-full border-b border-black-500 mt-2 mb-4" />

                {loading ? (
                    <View className="py-8">
                        <ActivityIndicator />
                    </View>
                ) : users.length === 0 ? (
                    <View className="py-6">
                        <Text className="text-gray-500">No users found.</Text>
                    </View>
                ) : (
                    users.map((u) => (
                        <View key={u.id}>
                            <View className="flex-row items-center">
                                <View className="pr-2 justify-center items-center">
                                    <MdiIcon path={mdi.mdiAccountBoxOutline} size={30} />
                                </View>
                                <View className="flex-1 ml-1">
                                    <Text className="text-base font-regular text-black-900">
                                        {u.username}{" "}
                                        <Text className="text-xs text-gray-500">
                                            ({u.role})
                                        </Text>
                                    </Text>
                                    <Text className="text-xs font-regular text-gray-500">
                                        {u.email}
                                    </Text>
                                    <Text className="text-xs font-regular text-gray-500">
                                        Created: {formatCreatedAt(u.created_at)}
                                    </Text>
                                </View>

                                <Pressable className="w-10 h-10 items-end" onPress={() => openDelete(u)}>
                                    <MdiIcon path={mdi.mdiAccountOffOutline} size={28} />
                                </Pressable>
                            </View>

                            <View className="w-full border-[0.5px] bg-gray-200 mt-2 mb-4" />
                        </View>
                    ))
                )}

                {/* System Overview */}
                <View className="w-full items-start mt-4">
                    <Text className="text-lg font-semibold text-black-800">System Overview</Text>
                </View>

                <View className="w-full border-b bg-black-300 mt-2 mb-4" />

                <View className="flex-row items-start">
                    <View className="w-10 h-10 items-center">
                        <MdiIcon path={mdi.mdiDevices} size={30}></MdiIcon>
                    </View>
                    <View className="flex-1 ml-2 py-2">
                        <Text className="text-base font-regular text-black-900">Total Devices: {totalDevices}</Text>
                    </View>
                </View>

                <View className="w-full border-[0.5px] bg-gray-200 mt-2 mb-4" />

                <View className="flex-row items-start">
                    <View className="w-10 h-10 items-center">
                        <MdiIcon path={mdi.mdiLightbulbGroupOutline} size={30}></MdiIcon>
                    </View>
                    <View className="flex-1 ml-2 py-2">
                        <Text className="text-base font-regular text-black-900">Controllable Devices: {controllableDevices}</Text>
                    </View>
                </View>

                <View className="w-full border-[0.5px] bg-gray-200 mt-2 mb-4" />

                <View className="flex-row items-start">
                    <View className="w-10 h-10 items-center">
                        <MdiIcon path={mdi.mdiMotionSensor} size={30}></MdiIcon>
                    </View>
                    <View className="flex-1 ml-2 py-2">
                        <Text className="text-base font-regular text-black-900">Sensors: {totalSensors}</Text>
                    </View>
                </View>

                <View className="w-full border-[0.5px] bg-gray-200 mt-2 mb-4" />

                <View className="flex-row items-start">
                    <View className="w-10 h-10 items-center">
                        <MdiIcon path={mdi.mdiHomeAutomation} size={30}></MdiIcon>
                    </View>
                    <View className="flex-1 ml-2 py-2">
                        <Text className="text-base font-regular text-black-900">Total Automations: {totalAutomations}</Text>
                    </View>
                </View>

                <View className="w-full border-[0.5px] bg-gray-200 mt-2 mb-4" />
                <View className="h-10" />
            </ScrollView>
            <ConfirmDialog
                visible={deleteOpen}
                title="Remove user?"
                message={
                deleteTarget
                    ? `This will delete ${deleteTarget.username} (${deleteTarget.email}).`
                    : undefined
            }
                confirmText="Delete"
                cancelText="Cancel"
                destructive
                confirmDisabled={!deleteTarget || deleting}
                onCancel={closeDelete}
                onConfirm={onConfirmDelete}
            />
        </SafeAreaView>
    );
};

export default AdminPage;
