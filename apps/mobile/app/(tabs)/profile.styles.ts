import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.base,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        padding: 20,
    },
    profileCard: {
        alignItems: "center",
        backgroundColor: Colors.white,
        marginBottom: 24,
        borderColor: Colors.gray[200],
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.tertiary,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    name: {
        fontSize: 22,
        fontWeight: "bold",
        color: Colors.gray[900],
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: Colors.gray[600],
        marginBottom: 20,
    },
    stats: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.gray[200],
        width: "100%",
    },
    stat: {
        flex: 1,
        alignItems: "center",
    },
    statValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: Colors.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.gray[600],
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: Colors.gray[200],
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.gray[800],
        marginBottom: 12,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.gray[200],
    },
    menuIcon: {
        marginRight: 16,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.gray[900],
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 12,
        color: Colors.gray[600],
    },
    logoutButton: {
        marginBottom: 16,
        borderColor: Colors.error[500],
    },
    version: {
        fontSize: 12,
        color: Colors.gray[500],
        textAlign: "center",
    },
});
