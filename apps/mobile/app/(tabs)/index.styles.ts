import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    // Search Section Styles
    searchSection: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 100, // Make sure this is above the list
        paddingHorizontal: 8,
        // Note: paddingTop is applied dynamically via inline styles using useSafeAreaInsets
    },
    filterButton: {
        width: 52,
        height: 52,
    },
    filterButtonGlass: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 26,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.08)',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeFilterDot: {
        position: 'absolute',
        top: 14,
        right: 14,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
        borderWidth: 1,
        zIndex: 2,
    },
    // Suggestion Overlay Styles
    suggestionsOverlay: {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 0,
        zIndex: 90,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderBottomWidth: 0,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        // Glass shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
    },
    searchBlur: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    searchGlassContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        // Glass shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    searchGradientBorder: {
        borderRadius: 18,
        padding: 2,
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchPlaceholder: {
        flex: 1,
        fontSize: 16,
    },
    searchContainerFocused: {
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        padding: 0,
    },
    searchInputFocused: {
    },
    clearButton: {
        padding: 4,
        marginLeft: 8,
    },
    searchLoader: {
        marginLeft: 8,
    },
    // Filter Chips Styles
    filterContainer: {
        gap: 6, // Reduced gap
        paddingRight: 16,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4, // Smaller gap
        paddingHorizontal: 10, // Reduced from 16
        paddingVertical: 8, // Reduced from 10
        borderRadius: 14, // Smaller radius
        borderWidth: 1,
    },
    filterChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    filterChipText: {
        fontSize: 12, // Reduced from 14
        fontWeight: '600',
    },
    filterChipTextActive: {
        color: Colors.white,
    },
    // List Styles
    list: {
        // paddingTop is applied dynamically via inline styles using headerHeight
        paddingHorizontal: 0, // Full width cards
        paddingBottom: 120, // Increased for safe area + tab bar
    },
    // Loading State Styles
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingContent: {
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 8,
    },
    loadingSubtext: {
        fontSize: 14,
    },
    // Error State Styles
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 12,
    },
    errorSubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
        maxWidth: 280,
    },
    retryButton: {
        borderRadius: 14,
        overflow: 'hidden',
        minWidth: 160,
    },
    retryGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        gap: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.white,
    },
    // Empty State Styles
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIconContainer: {
        marginBottom: 24,
    },
    emptyIconGradient: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 12,
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
        maxWidth: 280,
    },
    createEventButton: {
        borderRadius: 14,
        overflow: 'hidden',
        minWidth: 180,
    },
    createEventGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        gap: 10,
    },
    createEventText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        gap: 12,
    },
    modalSearchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
    },
    modalSearchInput: {
        flex: 1,
        fontSize: 14,
        padding: 0,
    },
    cancelButton: {
        paddingVertical: 4,
        paddingHorizontal: 4,
    },
    cancelText: {
        fontSize: 10,
        color: Colors.primary,
        fontWeight: '600',
    },
    suggestionsList: {
        flex: 1,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        gap: 14,
    },
    suggestionContent: {
        flex: 1,
    },
    suggestionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    suggestionSubtitle: {
        fontSize: 14,
    },
    noSuggestions: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        gap: 16,
    },
    noSuggestionsText: {
        fontSize: 16,
        fontWeight: '500',
    },
});
