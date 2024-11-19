import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from sklearn.manifold import MDS
from sklearn.metrics import pairwise_distances
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from kneed import KneeLocator


file_path = '../csvData/Lab3 DataSet - Sheet1.csv' 
file_path_cat = '../csvData/updatedData.csv' 

df_cat = pd.read_csv(file_path_cat)
df = pd.read_csv(file_path)

df_cat.replace('DNF', np.nan, inplace=True)
df_cat.dropna(inplace=True)

df.replace('DNF', np.nan, inplace=True)
df.dropna(inplace=True)

columns = df[["Rank","Last Round Single Time","Last Round Average Time","Rounds Competed","Best Single Time","Best Average Time","Number of Competitors","Number of Penalties"]]
print("these are the columns", columns)

# scaler = StandardScaler()
# scaled_data = scaler.fit_transform(columns)

wcss = []
K = range(1, 11)
for k in K:
    kmeans = KMeans(n_clusters=k, random_state=42)
    kmeans.fit(columns)
    wcss.append(kmeans.inertia_)
    
# knee_locator = KneeLocator(range(1, 11), wcss, curve="convex", direction="decreasing")
# optimal_k = knee_locator.knee
# print("Optimal k determined by elbow method:", optimal_k)

plt.plot(K, wcss, marker='o')
plt.xlabel('Number of Clusters (k)')
plt.ylabel('WCSS')
plt.title('Elbow Method')
plt.savefig('elbow_method.png')  
plt.close()

optimal_k = 3


kmeans = KMeans(n_clusters=optimal_k, random_state=42)
clusters = kmeans.fit_predict(columns)
df['Cluster'] = clusters


clustered_data = columns.copy()
clustered_data['Cluster'] = clusters
clustered_data.to_csv('clustered_data.csv', index=False)


# pca = PCA(n_components=2)
# pca_result = pca.fit_transform(scaled_data)
# vectors = pca.components_.T

# biPlot = pd.DataFrame(vectors, columns=['PC1', 'PC2'])
# biPlot['Feature'] = columns.columns
# biPlot.to_csv("biPlot.csv", index=False)

# pca_df = pd.DataFrame(pca_result, columns=['PC1', 'PC2'])
# pca_df.to_csv('pca_result.csv', index=False)

#EXPLAINED VARIANCE
# pca = PCA(n_components=8)
# pca_result = pca.fit_transform(columns)

# explained_variance = pca.explained_variance_ratio_
# explained_variance_df = pd.DataFrame(explained_variance, columns=['Explained Variance'])
# explained_variance_df.to_csv('explained_variance.csv', index=True)

# correlation_matrix = df.corr()

# # attribute_matrix = 1 - np.abs(correlation_matrix)

# # # Apply MDS using the distance matrix

# # mds_results = MDS.fit_transform(attribute_matrix)

# # # Save the MDS results to CSV
# # mds_df = pd.DataFrame(mds_results, columns=['Dim1', 'Dim2'])
# # mds_df['Attribute'] = columns.columns
# # mds_df.to_csv("MDS(Attributes).csv", index=False)

# # distance_matrix = pairwise_distances(scaled_data, metric='euclidean')
# # mds_results = MDS.fit_transform(distance_matrix)
# # print(mds_results)

# # temp = pd.DataFrame(mds_results, columns=['Dim1', 'Dim2'])
# # temp.to_csv("MDS(Data).csv", index = False)

# abs_corr_matrix = correlation_matrix.abs().sum(axis=0)
# top_5_attributes = abs_corr_matrix.nlargest(5).index  

# para_abs_corr = correlation_matrix.abs()

# correlation_sums = para_abs_corr.sum(axis=1)
# A1 = correlation_sums.idxmax()

# ordered_axes = [A1]

# while len(ordered_axes) < 8:
#     last_added_axis = ordered_axes[-1]
    
   
#     correlations_with_last = para_abs_corr[last_added_axis]
    
#     next_axis = correlations_with_last.drop(ordered_axes).idxmax()
#     ordered_axes.append(next_axis)

# # correlation_matrix.to_csv('correlation_matrix.csv')

# scatter_attributes = df[top_5_attributes].copy()
# scatter_attributes['Name'] = df_cat['Name']
# scatter_attributes['Representation'] = df_cat['Representation']
# scatter_attributes.to_csv('scatter_attributes.csv', index=False)

# para_attributes = df[ordered_axes].copy()
# para_attributes['Name'] = df_cat['Name']
# para_attributes['Representation'] = df_cat['Representation']
# para_attributes.to_csv('para_attributes.csv', index=False)
